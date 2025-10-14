import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';
import { sendWorkshopUpdateEmail } from '@/lib/email';

// Helper function to detect what fields changed
function detectChanges(oldWorkshop, newData) {
  const changes = [];
  const fieldLabels = {
    title: 'Workshop Title',
    description: 'Description',
    instructor: 'Instructor',
    date: 'Date & Time',
    duration: 'Duration',
    price: 'Price',
    max_participants: 'Maximum Participants',
    workshop_link: 'Workshop Link',
  };

  for (const [key, label] of Object.entries(fieldLabels)) {
    const oldValue = oldWorkshop[key];
    const newValue = newData[key];
    
    // Handle date comparison separately
    if (key === 'date') {
      const oldDate = new Date(oldValue).getTime();
      const newDate = new Date(newValue).getTime();
      if (oldDate !== newDate) {
        changes.push(label);
      }
    } else if (oldValue !== newValue) {
      changes.push(label);
    }
  }

  return changes;
}

// PUT update workshop
export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // First, get the old workshop data to detect changes
    const { data: oldWorkshop, error: fetchError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Detect what changed
    const changedFields = detectChanges(oldWorkshop, {
      title: body.title,
      description: body.description,
      instructor: body.instructor,
      date: body.date,
      duration: body.duration,
      price: body.price,
      max_participants: body.maxParticipants,
      workshop_link: body.workshopLink,
    });

    // Update the workshop
    const { data: workshop, error } = await supabaseAdmin
      .from('workshops')
      .update({
        title: body.title,
        description: body.description,
        instructor: body.instructor,
        date: body.date,
        duration: body.duration,
        price: body.price,
        max_participants: body.maxParticipants,
        workshop_link: body.workshopLink,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update email template
    if (body.emailSubject && body.emailMessage) {
      await supabaseAdmin
        .from('workshop_email_templates')
        .upsert(
          {
            workshop_id: parseInt(id),
            subject: body.emailSubject,
            message: body.emailMessage,
          },
          { onConflict: 'workshop_id' }
        );
    }

    // If there are changes, notify all registered users
    if (changedFields.length > 0) {
      console.log('🔄 Workshop changes detected:', changedFields);
      console.log('📋 Fetching registrations for workshop ID:', id);
      
      // Get all completed registrations for this workshop
      const { data: registrations, error: regError } = await supabaseAdmin
        .from('workshop_registrations')
        .select('*')
        .eq('workshop_id', id)
        .eq('status', 'completed');

      console.log('📊 Registration query result:', {
        found: registrations?.length || 0,
        error: regError,
        sample: registrations?.[0]
      });

      if (regError) {
        console.error('❌ Error fetching registrations:', regError);
      } else if (registrations && registrations.length > 0) {
        console.log(`👥 Found ${registrations.length} registrations. Fetching user details from auth...`);
        
        // Fetch user details from auth for each registration
        const usersWithDetails = await Promise.all(
          registrations.map(async (registration) => {
            try {
              const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(registration.user_id);
              
              if (authError) {
                console.error(`❌ Error fetching user ${registration.user_id}:`, authError);
                return null;
              }
              
              if (authUser?.user?.email) {
                return {
                  registration,
                  email: authUser.user.email,
                  name: authUser.user.user_metadata?.name || 
                        authUser.user.user_metadata?.full_name || 
                        authUser.user.email.split('@')[0]
                };
              }
              
              console.warn(`⚠️ No email found for user ${registration.user_id}`);
              return null;
            } catch (error) {
              console.error(`❌ Exception fetching user ${registration.user_id}:`, error);
              return null;
            }
          })
        );

        // Filter out null values (users that couldn't be fetched)
        const validUsers = usersWithDetails.filter(u => u !== null);
        
        console.log(`📧 Sending update emails to ${validUsers.length} participants...`);
        
        if (validUsers.length === 0) {
          console.warn('⚠️ No valid user emails found!');
        }

        // Send update emails to all registered users
        const emailPromises = validUsers.map(async (userInfo, index) => {
          try {
            console.log(`📤 Sending email ${index + 1}/${validUsers.length} to ${userInfo.email}...`);
            
            const result = await sendWorkshopUpdateEmail({
              to: userInfo.email,
              userName: userInfo.name,
              workshopTitle: workshop.title,
              workshopDate: workshop.date,
              workshopDuration: workshop.duration,
              workshopLink: workshop.workshop_link,
              instructor: workshop.instructor,
              changedFields: changedFields,
            });
            
            if (result.success) {
              console.log(`✅ Email ${index + 1}/${validUsers.length} sent successfully to ${userInfo.email}`);
            } else {
              console.error(`❌ Email ${index + 1}/${validUsers.length} failed for ${userInfo.email}:`, result.error);
            }
            
            return result;
          } catch (emailError) {
            console.error(`❌ Exception sending email ${index + 1}/${validUsers.length} to ${userInfo.email}:`, emailError);
            return { success: false, error: emailError };
          }
        });

        // Wait for all emails to be sent
        const results = await Promise.allSettled(emailPromises);
        
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
        const failCount = validUsers.length - successCount;
        
        console.log(`✅ Email notification summary: ${successCount} succeeded, ${failCount} failed out of ${validUsers.length} total`);
      } else {
        console.log('ℹ️ No registered participants found for this workshop');
      }
    } else {
      console.log('ℹ️ No changes detected - email notifications skipped');
    }

    return NextResponse.json({ 
      workshop,
      notificationsSent: changedFields.length > 0,
      changedFields: changedFields
    });
  } catch (error) {
    console.error('❌ Error updating workshop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE workshop
export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const { error } = await supabaseAdmin
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
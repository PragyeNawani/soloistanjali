Disabled email confirmation on the supabase
Merged Login and Sign Up button. Only Login button is present in the navbar.


components/admin/saleschart
   line 266 changed from`<p className="text-xs text-blue-600 mt-1">{chartData.length} transactions</p>`


app/api/blogs/[slug]/route.js
.single() → .maybeSingle()
One in GET, One in PUT


Names: Oxford blue, Navy, Midnight, Black pearl, Rich black
Hex Codes: #11244A, #0B1C3E, #061831, #051024, #030A1C


git remote add origin git@github.com:PragyeNawani/musicacademy.git
git branch -M main
git push -u origin main

Error: duplicate key value violates unique constraint "purchases_user_id_course_id_key"

1. Cron Job Route (Primary Cleanup)
File location: app/api/workshops/cleanup-pending/route.js

This route:

Deletes ALL pending registrations older than 24 hours across all users
Should be called by a cron job periodically (e.g., daily)
Protected by a CRON_SECRET environment variable
Setup Instructions:
Add environment variable to your .env.local:
bash
CRON_SECRET=your-random-secret-key-here
Set up the cron job (choose one method): Option A: Vercel Cron Jobs (if you're using Vercel): Create vercel.json in your project root:
json
   {
     "crons": [
       {
         "path": "/api/workshops/cleanup-pending",
         "schedule": "0 2 * * *"
       }
     ]
   }
This runs daily at 2 AM.

Option B: External Cron Service (like cron-job.org):

Sign up for a free cron service
Set it to POST to: https://yourdomain.com/api/workshops/cleanup-pending
Add header: Authorization: Bearer your-cron-secret
Schedule: Daily
Option C: Manual Trigger (for testing):

bash
   curl -X POST https://yourdomain.com/api/workshops/cleanup-pending \
     -H "Authorization: Bearer your-cron-secret"
2. Inline Cleanup (Secondary, User-Specific)
Updated in the register route:

Automatically deletes old pending registrations for the current user only
Runs every time a user tries to register
Cleans up registrations older than 1 hour
Non-critical (won't stop registration if it fails)
Benefits of This Dual Approach:
Immediate cleanup: When users return to retry payment, their old pending records are cleaned up automatically
System-wide cleanup: The cron job catches any orphaned records that weren't cleaned up inline
No database bloat: Prevents accumulation of failed payment attempts
Better performance: Keeps the table lean and queries fast
Testing the Cleanup:
Test inline cleanup: Try to register for a workshop, close the payment modal, wait 1 hour, and try again
Test cron job: Call the endpoint manually with the authorization header
Check logs: Both methods log what they delete for monitoring
This gives you a robust cleanup system that handles both recent and old abandoned registrations!


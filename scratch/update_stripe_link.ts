import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePaymentLink() {
  const newLink = 'https://buy.stripe.com/test_9B6aEX5cc5Fw1BB5oB4Ja00';
  
  console.log(`Updating payment link to: ${newLink}`);
  
  // 1. Get the latest settings ID
  const { data: latest, error: fetchError } = await supabase
    .from('ai_system_settings')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !latest) {
    console.error('Could not find latest settings row:', fetchError);
    return;
  }

  // 2. Update that specific row
  const { data, error } = await supabase
    .from('ai_system_settings')
    .update({ stripe_payment_link: newLink })
    .eq('id', latest.id)
    .select();

  if (error) {
    console.error('Error updating payment link:', error);
  } else {
    console.log('Successfully updated payment link in database!');
    console.log(data);
  }
}

updatePaymentLink();

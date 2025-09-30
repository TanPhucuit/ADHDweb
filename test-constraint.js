const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pjvztaykgkxnefwsyqvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('Getting existing action_label values...');
    
    // Get existing distinct values
    const { data: distinctValues } = await supabase
      .from('action')  
      .select('action_label')
      .not('action_label', 'is', null);
      
    if (distinctValues) {
      const unique = [...new Set(distinctValues.map(r => r.action_label))];
      console.log('Existing action_label values in DB:', unique);
    }
    
    // Try inserting with each possible value to see what fails
    const testValues = ['focus', 'rest', 'praise', 'encourage', 'time_check', 'nghi-ngoi', 'khen-ngoi'];
    
    for (const testValue of testValues) {
      try {
        const { error } = await supabase
          .from('action')
          .insert({ 
            parentid: 999, 
            action_label: testValue,
            timestamp: new Date().toISOString()
          });
          
        if (error) {
          console.log(`❌ ${testValue}: ${error.message}`);
        } else {
          console.log(`✅ ${testValue}: OK (will rollback)`);
          // Delete the test record
          await supabase.from('action').delete().eq('parentid', 999);
        }
      } catch (err) {
        console.log(`❌ ${testValue}: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.log('Error:', err.message);
  }
})();
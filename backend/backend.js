// Initialize Supabase Client
// Replace with your actual Supabase Project URL and Anon Key
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (error) {
    console.warn('Supabase is not initialized yet. Please update your URL and Key.');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointment-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!form || !formStatus || !submitBtn) return; // Guard clause in case form is not on the page

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Capture data from form fields
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const serviceInput = document.getElementById('service');
        const messageInput = document.getElementById('message');

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const service = serviceInput.value;
        const message = messageInput.value.trim();

        // Basic Validation
        if (!name || !phone || !service) {
            showStatus('Please fill in all required fields.', 'error');
            return;
        }

        // Phone number rough validation length
        if (phone.length < 10) {
            showStatus('Please enter a valid phone number.', 'error');
            return;
        }

        // Disable button while submitting to prevent duplicate requests
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

        try {
            // Send data to Supabase using insert()
            const { error } = await supabase
                .from('enquiries')
                .insert([
                    { name, phone, service, message }
                ]);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Success handling
            showStatus('Enquiry submitted successfully!', 'success');
            
            // Clear form after submit
            form.reset();
        } catch (error) {
            // Error handling
            console.error('Submission error:', error);
            showStatus('Something went wrong. Please try again.', 'error');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            
            // Optionally clear the status message after a few seconds
            setTimeout(() => {
                formStatus.classList.add('hidden');
                formStatus.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
            }, 5000);
        }
    });

    /**
     * Helper function to show status messages
     * @param {string} text - The message text
     * @param {string} type - 'success' or 'error' 
     */
    function showStatus(text, type) {
        formStatus.textContent = text;
        
        // Remove existing style classes
        formStatus.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
        
        // Add new styling based on success or error type
        if (type === 'success') {
            formStatus.classList.add('bg-green-100', 'text-green-700');
        } else {
            formStatus.classList.add('bg-red-100', 'text-red-700');
        }
    }
});

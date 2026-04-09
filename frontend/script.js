document.addEventListener('DOMContentLoaded', () => {
    // --- EMAILJS INIT ---
    if (window.emailjs) {
        emailjs.init("jgJQDGAo03QYbuFuz");
    }

    // --- PART 1: ACCORDION LOGIC ---
    const accordions = document.querySelectorAll('.category-accordion');

    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        // Part 5 Debug Fix: Ensure we use the correct class "service-details"
        const content = accordion.querySelector('.service-details');
        const icon = accordion.querySelector('.accordion-icon');
        
        header.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!content) return; // safety check
            
            // Check if this accordion is currently open
            const isOpen = !content.classList.contains('hidden');

            // Close all accordions
            document.querySelectorAll('.service-details').forEach(c => {
                c.style.maxHeight = '0px';
                c.classList.remove('opacity-100');
                c.classList.add('opacity-0');
                
                // Hide after transition finishes
                setTimeout(() => {
                    if (c.style.maxHeight === '0px') {
                        c.classList.add('hidden');
                    }
                }, 500); // matches the tailwind duration-500
            });

            document.querySelectorAll('.accordion-icon').forEach(i => {
                i.style.transform = 'rotate(0deg)';
            });
            
            document.querySelectorAll('.category-accordion').forEach(a => {
                a.classList.remove('ring-2', 'ring-premium-rose/50');
            });

            // If it was closed, open it now
            if (!isOpen) {
                // Remove display:none
                content.classList.remove('hidden');
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const innerHeight = content.firstElementChild ? content.firstElementChild.scrollHeight : 500;
                        
                        content.style.maxHeight = innerHeight + "px";
                        content.classList.remove('opacity-0');
                        content.classList.add('opacity-100');
                        
                        icon.style.transform = 'rotate(180deg)';
                        accordion.classList.add('ring-2', 'ring-premium-rose/50');
                    });
                });
            }
        });
    });

    // --- PART 3: CONNECT SERVICES TO FORM ---
    const bookButtons = document.querySelectorAll('.book-service-btn');
    const serviceSelect = document.getElementById('service');
    
    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent accordion from toggling when clicking button
            
            const serviceValue = btn.getAttribute('data-service');
            if (serviceValue && serviceSelect) {
                serviceSelect.value = serviceValue;
            }
            
            // Smooth scroll to form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- PART 2 & 4: SUPABASE INTEGRATION & FORM VALIDATION ---
    const SUPABASE_URL = 'YOUR_SUPABASE_URL_PLACEHOLDER';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER';
    
    // Initialize Supabase Client
    let supabaseClient = null;
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn("Supabase script not loaded");
        }
    } catch (e) {
        console.warn("Could not handle Supabase initialization (likely placeholder keys): ", e);
    }

    const form = document.getElementById('appointment-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form Fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value.trim();

            // Validation check
            if (!name || !email || !service) {
                alert('Please fill out all required fields.');
                return;
            }

            // UI State updates
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting...';
            }
            if (formStatus) {
                formStatus.classList.add('hidden');
                formStatus.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
            }

            try {
                // Supabase Insertion Attempt
                try {
                    if (!supabaseClient) {
                        console.warn("Supabase is not initialized. Supabase insertion skipped.");
                    } else if (SUPABASE_URL === 'YOUR_SUPABASE_URL_PLACEHOLDER') {
                        // Simulate successful submission for demonstration
                        console.warn("Using placeholder Supabase credentials. Simulating submission.");
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        // Actual Insert into "enquiries" table
                        const { data, error } = await supabaseClient
                            .from('enquiries')
                            .insert([
                                { name, email, service, message }
                            ]);

                        if (error) throw error;
                    }
                } catch (supabaseError) {
                    console.error("Supabase Insertion Error:", supabaseError);
                }

                // --- EmailJS Integration ---
                // Step 2: Send data using emailjs.send
                // The third parameter matches variables defined in your EmailJS template.
                if (window.emailjs) {
                    try {
                        await emailjs.send(
                            'service_sdqapro', // Service ID
                            'template_ot9os4n', // Template ID
                            {
                                name: name,
                                email: email,
                                service: service,
                                message: message
                            }
                        );
                    } catch (e) {
                        console.warn("EmailJS failed to send:", e);
                    }
                }

                // Success Message update
                if (formStatus) {
                    formStatus.textContent = 'Booking submitted successfully';
                    formStatus.classList.add('bg-green-100', 'text-green-700');
                    formStatus.classList.remove('hidden');
                }

                form.reset();

            } catch (error) {
                console.error('Error submitting form:', error);
                // Display error message
                if (formStatus) {
                    formStatus.textContent = 'Failed to submit enquiry. Please try again.';
                    formStatus.classList.add('bg-red-100', 'text-red-700');
                    formStatus.classList.remove('hidden');
                }
            } finally {
                // Restore Button State
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Request';
                }
                
                // Hide status message after 5 seconds
                if (formStatus) {
                    setTimeout(() => {
                        formStatus.classList.add('hidden');
                    }, 5000);
                }
            }
        });
    }

    // --- PART 5: CONTACT FLOATING BUTTONS LOGIC ---
    const floatPhone = document.getElementById('floating-phone-btn');
    if (floatPhone) {
        floatPhone.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Simple robust regex to check if user is on a mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                window.location.href = 'tel:9908926299';
            } else {
                alert('Calling is only available on mobile devices. Please use WhatsApp.');
            }
        });
    }
});

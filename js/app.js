// Initialize interactive elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // Tab Switching Logic for 'How It Works' Section
    // ----------------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ----------------------------------------------------------------------
    // Sticky Navbar Logic
    // ----------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
    });

    // ----------------------------------------------------------------------
    // Simple Form Validation Feedback
    // ----------------------------------------------------------------------
    const regForm = document.getElementById('reg-form');
    if(regForm) {
        const submitBtn = regForm.querySelector('.btn-primary');
        submitBtn.addEventListener('click', (e) => {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;

            if (!name || !phone || !city) {
                alert('Please fill out all required fields.');
                return;
            }

            // Mock submission
            submitBtn.innerHTML = 'Registering...';
            submitBtn.disabled = true;

            setTimeout(() => {
                alert('Thank you for registering with PHERA. Our team will contact you shortly.');
                const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
                submitBtn.innerHTML = currentLang === 'hi' ? 'अभी रजिस्टर करें' : 'Register Now';
                submitBtn.disabled = false;
                regForm.reset();
            }, 1500);
        });
    }
});

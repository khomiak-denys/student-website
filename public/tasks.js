document.addEventListener("DOMContentLoaded", () => {
    const profileWrapper = document.querySelector('.profile-wrapper');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const offcanvasHeader = document.querySelector('.offcanvas-header');
    const offcanvasBody = document.querySelector('.offcanvas-body');
    const navbarContainer = document.querySelector('.navbar .container-fluid');
    const sidebar = document.querySelector('.sidebar');

    function moveElements() {
        if (!profileWrapper || !sidebarNav || !navbarContainer || !sidebar || !offcanvasHeader || !offcanvasBody) {
            return;
        }

        if (window.innerWidth < 992) {
            const closeBtn = offcanvasHeader.querySelector('.btn-close');
            if (closeBtn && !offcanvasHeader.contains(profileWrapper)) {
                offcanvasHeader.insertBefore(profileWrapper, closeBtn);
                profileWrapper.style.display = 'flex';
            }
            if (!offcanvasBody.contains(sidebarNav)) {
                offcanvasBody.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        } else {
            if (!navbarContainer.contains(profileWrapper)) {
                navbarContainer.appendChild(profileWrapper);
                profileWrapper.style.display = 'flex';
            }
            if (!sidebar.contains(sidebarNav)) {
                sidebar.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        }
    }

    window.addEventListener("load", moveElements);
    window.addEventListener("resize", moveElements);
    moveElements();
});
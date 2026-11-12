    // Global Application State
    let currentUser = null; 
    let requests = [
      {
        id: 101,
        room: "201",
        name: "Sarah Parker",
        department: "Housekeeping",
        priority: "Normal",
        description: "Please send 2 extra pillows and a set of clean bath towels.",
        status: "Pending",
        time: "10:15 AM"
      },
      {
        id: 102,
        room: "405",
        name: "David Smith",
        department: "Maintenance",
        priority: "Urgent",
        description: "Air conditioner is leaking water on the desk.",
        status: "In Progress",
        time: "10:45 AM"
      }
    ];

    // 1. Switch Login Tabs (Guest vs Staff)
    function switchLoginRole(role) {
      document.getElementById('login-tab-guest').classList.remove('active');
      document.getElementById('login-tab-admin').classList.remove('active');
      
      if (role === 'guest') {
        document.getElementById('login-tab-guest').classList.add('active');
        document.getElementById('guestLoginForm').style.display = 'block';
        document.getElementById('adminLoginForm').style.display = 'none';
      } else {
        document.getElementById('login-tab-admin').classList.add('active');
        document.getElementById('guestLoginForm').style.display = 'none';
        document.getElementById('adminLoginForm').style.display = 'block';
      }
    }

    // 2. Show/Hide Password Toggle Function
    function togglePasswordVisibility(inputId, btnElement) {
      const input = document.getElementById(inputId);
      const icon = btnElement.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }

    // 3. Auto-select Department based on chosen Staff Member
    function autoSelectDepartment() {
      const staffSelect = document.getElementById('loginStaffMember');
      const selectedOption = staffSelect.options[staffSelect.selectedIndex];
      const dept = selectedOption.getAttribute('data-dept');
      if (dept) {
        document.getElementById('loginDepartment').value = dept;
      }
    }

    // 4. Handle Guest Login
    function handleGuestLogin(event) {
      event.preventDefault();
      const name = document.getElementById('loginGuestName').value.trim();
      const room = document.getElementById('loginRoomNumber').value.trim();
      const password = document.getElementById('guestPassword').value.trim();

      if (!name || !room || !password) {
        alert("Please fill in all fields including your Room Access Password!");
        return;
      }

      currentUser = { type: 'guest', name: name, room: room };
      
      document.getElementById('login-view').classList.remove('active');
      document.getElementById('guest-view').classList.add('active');
      document.getElementById('header-user-area').style.display = 'flex';
      document.getElementById('logged-in-user-label').innerHTML = `<i class="fa-solid fa-user"></i> Guest: ${name} (Room ${room})`;
      
      document.getElementById('guestLoginForm').reset();
      renderGuestRequests();
    }

    // 5. Handle Staff Login
    function handleAdminLogin(event) {
      event.preventDefault();
      const staffName = document.getElementById('loginStaffMember').value;
      const department = document.getElementById('loginDepartment').value;
      const password = document.getElementById('staffPassword').value.trim();

      if (!staffName || !password) {
        alert("Please select a Staff Member and enter your Staff Portal Password!");
        return;
      }

      currentUser = { type: 'admin', name: staffName, department: department };

      document.getElementById('login-view').classList.remove('active');
      document.getElementById('admin-view').classList.add('active');
      document.getElementById('header-user-area').style.display = 'flex';
      document.getElementById('logged-in-user-label').innerHTML = `<i class="fa-solid fa-user-shield"></i> Staff: ${staffName} (${department})`;
      
      document.getElementById('admin-dept-filter').value = department;
      document.getElementById('adminLoginForm').reset();
      renderAdminRequests();
    }

    // 6. Logout Function
    function logoutUser() {
      currentUser = null;
      document.getElementById('header-user-area').style.display = 'none';
      document.getElementById('guest-view').classList.remove('active');
      document.getElementById('admin-view').classList.remove('active');
      document.getElementById('login-view').classList.add('active');
      switchLoginRole('guest');
    }

    // 7. Handle Service Request Submission (Guest)
    function handleFormSubmit(event) {
      event.preventDefault();

      const department = document.getElementById('department').value;
      const priority = document.getElementById('priority').value;
      const description = document.getElementById('description').value;

      const newRequest = {
        id: Date.now().toString().slice(-4),
        room: currentUser.room,
        name: currentUser.name,
        department: department,
        priority: priority,
        description: description,
        status: "Pending",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      requests.unshift(newRequest);
      document.getElementById('requestForm').reset();
      renderGuestRequests();
      renderAdminRequests();

      alert("Service Request Submitted Successfully!");
    }

    // 8. Render Guest Requests
    function renderGuestRequests() {
      const container = document.getElementById('guest-requests-list');
      const myRequests = requests.filter(req => req.room === currentUser.room);

      if (myRequests.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <p>You have not submitted any service requests yet.</p>
          </div>`;
        return;
      }

      let html = '';
      myRequests.forEach(req => {
        let badgeClass = 'badge-pending';
        if (req.status === 'In Progress') badgeClass = 'badge-progress';
        if (req.status === 'Completed') badgeClass = 'badge-completed';

        html += `
          <div class="request-item">
            <div class="request-header">
              <span class="request-dept"><i class="fa-solid fa-concierge-bell"></i> ${req.department}</span>
              <span class="badge ${badgeClass}">${req.status}</span>
            </div>
            <div class="request-meta">Room: <strong>${req.room}</strong> | Requested at: ${req.time}</div>
            <div class="request-desc">${req.description}</div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // 9. Render Admin Requests
    function renderAdminRequests() {
      const container = document.getElementById('admin-requests-list');
      const selectedDept = document.getElementById('admin-dept-filter').value;

      const filteredRequests = requests.filter(req => {
        return selectedDept === 'ALL' || req.department === selectedDept;
      });

      if (filteredRequests.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-clipboard-check"></i>
            <p>No requests found for this department filter.</p>
          </div>`;
        return;
      }

      let html = '';
      filteredRequests.forEach(req => {
        let badgeClass = 'badge-pending';
        if (req.status === 'In Progress') badgeClass = 'badge-progress';
        if (req.status === 'Completed') badgeClass = 'badge-completed';

        html += `
          <div class="request-item">
            <div class="request-header">
              <span class="request-dept">
                <i class="fa-solid fa-door-closed"></i> Room ${req.room} (${req.name})
              </span>
              <span class="badge ${badgeClass}">${req.status}</span>
            </div>
            <div class="request-meta">
              Dept: <strong>${req.department}</strong> | Priority: <strong>${req.priority}</strong> | Time: ${req.time}
            </div>
            <div class="request-desc">${req.description}</div>
            <div class="admin-controls">
              <button class="btn-sm" onclick="updateStatus('${req.id}', 'In Progress')">
                <i class="fa-solid fa-spinner"></i> Mark In-Progress
              </button>
              <button class="btn-sm" onclick="updateStatus('${req.id}', 'Completed')">
                <i class="fa-solid fa-check"></i> Mark Completed
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // 10. Update Request Status
    function updateStatus(id, newStatus) {
      const target = requests.find(req => req.id.toString() === id.toString());
      if (target) {
        target.status = newStatus;
        if (currentUser.type === 'guest') {
          renderGuestRequests();
        } else {
          renderAdminRequests();
        }
      }
    }

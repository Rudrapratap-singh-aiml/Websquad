    // 1. Initial Sample Data (Stored in Array of Objects)
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

    // 2. View Switcher Function (Guest vs Staff)
    function switchView(viewName) {
      document.getElementById('guest-view').classList.remove('active');
      document.getElementById('admin-view').classList.remove('active');
      document.getElementById('guest-tab-btn').classList.remove('active');
      document.getElementById('admin-tab-btn').classList.remove('active');

      if (viewName === 'guest') {
        document.getElementById('guest-view').classList.add('active');
        document.getElementById('guest-tab-btn').classList.add('active');
      } else {
        document.getElementById('admin-view').classList.add('active');
        document.getElementById('admin-tab-btn').classList.add('active');
      }
    }

    // 3. Handle Form Submission
    function handleFormSubmit(event) {
      event.preventDefault(); // Prevents page reload on submit

      // Capture Form Data
      const room = document.getElementById('roomNumber').value;
      const name = document.getElementById('guestName').value;
      const department = document.getElementById('department').value;
      const priority = document.getElementById('priority').value;
      const description = document.getElementById('description').value;

      // Create new request object
      const newRequest = {
        id: Date.now().toString().slice(-4), // Simple 4-digit unique ID
        room: room,
        name: name,
        department: department,
        priority: priority,
        description: description,
        status: "Pending",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add to beginning of array
      requests.unshift(newRequest);

      // Reset form fields
      document.getElementById('requestForm').reset();

      // Refresh UI displays
      renderGuestRequests();
      renderAdminRequests();

      alert("Service Request Submitted Successfully!");
    }

    // 4. Render Guest Request List
    function renderGuestRequests() {
      const container = document.getElementById('guest-requests-list');

      if (requests.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <p>No active service requests found.</p>
          </div>`;
        return;
      }

      let html = '';
      requests.forEach(req => {
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

    // 5. Render Admin Request List with Filters & Status Controls
    function renderAdminRequests() {
      const container = document.getElementById('admin-requests-list');
      const selectedDept = document.getElementById('admin-dept-filter').value;

      // Filter array based on dropdown selection
      const filteredRequests = requests.filter(req => {
        return selectedDept === 'ALL' || req.department === selectedDept;
      });

      if (filteredRequests.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-clipboard-check"></i>
            <p>No requests for this department.</p>
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

    // 6. Function to Update Request Status
    function updateStatus(id, newStatus) {
      const target = requests.find(req => req.id.toString() === id.toString());
      if (target) {
        target.status = newStatus;
        renderGuestRequests();
        renderAdminRequests();
      }
    }

    // Initial load execution
    renderGuestRequests();
    renderAdminRequests();
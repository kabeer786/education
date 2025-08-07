frappe.pages['digi-campus'].on_page_load = function(wrapper) {
	// Apply custom body class for full control
	$('body').addClass('digi-campus-body');
	
	// Inject critical styles to ensure everything is hidden
	const criticalStyles = `
		<style id="digi-campus-critical">
			.digi-campus-body .list-sidebar,
			.digi-campus-body .overlay-sidebar,
			.digi-campus-body .list-sidebar.overlay-sidebar.hidden-xs.hidden-sm.opened,
			.digi-campus-body .nav-item.dropdown.dropdown-help.dropdown-mobile.d-none.d-lg-block,
			.digi-campus-body [class*="sidebar"],
			.digi-campus-body .dropdown-help,
			.digi-campus-body .dropdown-mobile,
			.digi-campus-body .nav-item.dropdown,
			.digi-campus-body .navbar,
			.digi-campus-body #navbar,
			.digi-campus-body .navbar-home,
			.digi-campus-body #navbar-breadcrumbs,
			.digi-campus-body .btn-open-sidebar,
			.digi-campus-body .sidebar-toggle-btn,
			.digi-campus-body .menu-btn-group,
			.digi-campus-body [data-toggle="sidebar"] {
				display: none !important;
				visibility: hidden !important;
				width: 0 !important;
				height: 0 !important;
				opacity: 0 !important;
				position: fixed !important;
				left: -99999px !important;
				top: -99999px !important;
				z-index: -9999 !important;
				pointer-events: none !important;
			}
			
			.digi-campus-body .layout-main-section {
				margin-left: 0 !important;
				width: 100% !important;
				padding-left: 0 !important;
			}
			
			.digi-campus-body .page-container,
			.digi-campus-body .page-content {
				margin-top: 0 !important;
				padding-top: 0 !important;
			}
		</style>
	`;
	
	// Add the styles to head
	if (!$('#digi-campus-critical').length) {
		$('head').append(criticalStyles);
	}
	
	// Force hide ALL standard Frappe UI elements
	const elementsToHide = [
		'.layout-side-section',
		'.list-sidebar',
		'.overlay-sidebar',
		'.navbar-home',
		'.dropdown-help',
		'.dropdown-mobile',
		'.nav-item.dropdown',
		'#navbar-breadcrumbs',
		'.navbar-expand',
		'.navbar',
		'#navbar',
		'.btn-open-sidebar',
		'.sidebar-toggle-btn',
		'.menu-btn-group',
		'.page-head',
		'.page-head-content',
		'[data-toggle="sidebar"]',
		'.sidebar-toggle'
	];
	
	elementsToHide.forEach(selector => {
		$(selector).hide().remove();
	});
	
	$('.layout-main-section').css({
		'margin-left': '0',
		'width': '100%'
	});
	
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '',  // Empty title as we'll use custom header
		single_column: true
	});

	// Hide standard page header and any remaining elements
	page.$title_area.hide();
	page.parent.find('.page-head').hide();
	page.parent.find('.page-content').css('margin-top', '0');
	
	// Create the dashboard
	new DigiCampusDashboard(page);
	
	// Additional cleanup after page load
	setTimeout(() => {
		$('.list-sidebar').remove();
		$('.overlay-sidebar').remove();
		$('.dropdown-help').remove();
		$('.dropdown-mobile').remove();
		$('.sidebar-toggle-btn').remove();
		$('.menu-btn-group').remove();
		
		// Hide any dynamically added elements
		$('[data-toggle="sidebar"]').hide();
		$('.sidebar-toggle').hide();
	}, 100);
}

class DigiCampusDashboard {
	constructor(page) {
		this.page = page;
		this.setupMutationObserver();
		this.make();
		this.refresh();
	}
	
	setupMutationObserver() {
		// Create a mutation observer to watch for any dynamically added elements
		const observer = new MutationObserver((mutations) => {
			// List of selectors to hide
			const selectorsToHide = [
				'.list-sidebar',
				'.overlay-sidebar',
				'.dropdown-help',
				'.dropdown-mobile',
				'.nav-item.dropdown',
				'.btn-open-sidebar',
				'.sidebar-toggle-btn',
				'.menu-btn-group',
				'[data-toggle="sidebar"]',
				'.sidebar-toggle',
				'.navbar-home',
				'#navbar-breadcrumbs',
				'.navbar-expand'
			];
			
			// Hide any matching elements
			selectorsToHide.forEach(selector => {
				const elements = document.querySelectorAll(selector);
				elements.forEach(el => {
					el.style.display = 'none';
					el.style.visibility = 'hidden';
					el.remove(); // Remove the element completely
				});
			});
			
			// Ensure body keeps the custom class
			if (!document.body.classList.contains('digi-campus-body')) {
				document.body.classList.add('digi-campus-body');
			}
		});
		
		// Start observing the document for changes
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class', 'style']
		});
		
		// Also prevent default sidebar toggle behavior
		$(document).off('click', '[data-toggle="sidebar"]');
		$(document).on('click', '[data-toggle="sidebar"]', function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	}

	make() {
		this.$container = $(`
			<div class="digi-campus-wrapper">
				<!-- Custom Navigation Bar -->
				<nav class="digi-campus-navbar">
					<div class="navbar-container">
						<div class="navbar-brand">
							<div class="brand-logo">
								<i class="fas fa-graduation-cap"></i>
							</div>
							<div class="brand-text">
								<h1>Digi-Campus</h1>
								<span>Education Management System</span>
							</div>
						</div>
						<div class="navbar-menu">
							<a href="#" class="nav-item active" data-section="dashboard">
								<i class="fas fa-th-large"></i>
								<span>Dashboard</span>
							</a>
							<a href="#" class="nav-item" data-section="admissions">
								<i class="fas fa-user-graduate"></i>
								<span>Admissions</span>
							</a>
							<a href="#" class="nav-item" data-section="academics">
								<i class="fas fa-book-open"></i>
								<span>Academics</span>
							</a>
							<a href="#" class="nav-item" data-section="finance">
								<i class="fas fa-coins"></i>
								<span>Finance</span>
							</a>
							<a href="#" class="nav-item" data-section="reports">
								<i class="fas fa-chart-line"></i>
								<span>Reports</span>
							</a>
							<a href="#" class="nav-item" data-section="settings">
								<i class="fas fa-cog"></i>
								<span>Settings</span>
							</a>
						</div>
						<div class="navbar-actions">
							<button class="nav-button notification-btn">
								<i class="fas fa-bell"></i>
								<span class="notification-badge">3</span>
							</button>
							<button class="nav-button help-btn">
								<i class="fas fa-question-circle"></i>
							</button>
							<div class="user-menu">
								<img src="/assets/frappe/images/default-avatar.png" class="user-avatar">
								<span class="user-name">Admin</span>
								<i class="fas fa-chevron-down"></i>
							</div>
						</div>
					</div>
				</nav>

				<!-- Main Dashboard Content -->
				<div class="digi-campus-dashboard">
					<!-- Hero Section -->
					<div class="hero-section">
						<div class="hero-background"></div>
						<div class="hero-content">
							<h2 class="hero-welcome">Welcome back, Administrator</h2>
							<p class="hero-date">${frappe.datetime.get_today()}</p>
							<div class="hero-stats">
								<div class="hero-stat">
									<i class="fas fa-users"></i>
									<div>
										<span class="stat-value" id="active-students">0</span>
										<span class="stat-label">Active Students</span>
									</div>
								</div>
								<div class="hero-stat">
									<i class="fas fa-chalkboard-teacher"></i>
									<div>
										<span class="stat-value" id="active-courses">0</span>
										<span class="stat-label">Active Courses</span>
									</div>
								</div>
								<div class="hero-stat">
									<i class="fas fa-calendar-check"></i>
									<div>
										<span class="stat-value" id="today-classes">0</span>
										<span class="stat-label">Today's Classes</span>
									</div>
								</div>
							</div>
						</div>
						<div class="hero-actions">
							<button class="action-btn primary-action new-admission-btn">
								<i class="fas fa-user-plus"></i>
								<span>New Admission</span>
							</button>
							<button class="action-btn secondary-action mark-attendance-btn">
								<i class="fas fa-clipboard-check"></i>
								<span>Mark Attendance</span>
							</button>
							<button class="action-btn tertiary-action collect-fees-btn">
								<i class="fas fa-dollar-sign"></i>
								<span>Collect Fees</span>
							</button>
						</div>
					</div>

				<!-- Stats Cards -->
				<div class="stats-container">
					<div class="stats-grid">
						<div class="stat-card gradient-purple">
							<div class="stat-icon-wrapper">
								<i class="fas fa-user-graduate"></i>
							</div>
							<div class="stat-details">
								<h3 class="stat-number" id="total-students">0</h3>
								<p class="stat-label">Total Students</p>
								<div class="stat-trend trend-up">
									<i class="fas fa-arrow-up"></i>
									<span><span id="new-students">0</span> this month</span>
								</div>
							</div>
							<div class="stat-chart">
								<canvas id="students-mini-chart"></canvas>
							</div>
						</div>
						
						<div class="stat-card gradient-blue">
							<div class="stat-icon-wrapper">
								<i class="fas fa-book"></i>
							</div>
							<div class="stat-details">
								<h3 class="stat-number" id="total-programs">0</h3>
								<p class="stat-label">Active Programs</p>
								<div class="stat-trend">
									<i class="fas fa-layer-group"></i>
									<span><span id="total-courses">0</span> courses</span>
								</div>
							</div>
							<div class="stat-chart">
								<canvas id="programs-mini-chart"></canvas>
							</div>
						</div>
						
						<div class="stat-card gradient-green">
							<div class="stat-icon-wrapper">
								<i class="fas fa-clipboard-check"></i>
							</div>
							<div class="stat-details">
								<h3 class="stat-number" id="attendance-percentage">0%</h3>
								<p class="stat-label">Today's Attendance</p>
								<div class="stat-trend">
									<i class="fas fa-users"></i>
									<span><span id="students-marked">0</span> marked</span>
								</div>
							</div>
							<div class="stat-chart">
								<canvas id="attendance-mini-chart"></canvas>
							</div>
						</div>
						
						<div class="stat-card gradient-orange">
							<div class="stat-icon-wrapper">
								<i class="fas fa-dollar-sign"></i>
							</div>
							<div class="stat-details">
								<h3 class="stat-number" id="pending-fees">0</h3>
								<p class="stat-label">Pending Fees</p>
								<div class="stat-trend trend-up">
									<i class="fas fa-check-circle"></i>
									<span><span id="collected-fees">0</span> collected</span>
								</div>
							</div>
							<div class="stat-chart">
								<canvas id="fees-mini-chart"></canvas>
							</div>
						</div>
					</div>
				</div>

				<!-- Quick Actions Grid -->
				<div class="quick-actions-section">
					<h3 class="section-title">Quick Actions</h3>
					<div class="row">
						<div class="col-md-3">
							<div class="action-card" data-action="student-admission">
								<div class="action-icon bg-primary">
									<i class="fa fa-user-plus"></i>
								</div>
								<h4>Student Admission</h4>
								<p>Process new applications</p>
							</div>
						</div>
						<div class="col-md-3">
							<div class="action-card" data-action="mark-attendance">
								<div class="action-icon bg-success">
									<i class="fa fa-calendar-check"></i>
								</div>
								<h4>Mark Attendance</h4>
								<p>Record daily attendance</p>
							</div>
						</div>
						<div class="col-md-3">
							<div class="action-card" data-action="fee-collection">
								<div class="action-icon bg-warning">
									<i class="fa fa-money-bill"></i>
								</div>
								<h4>Fee Collection</h4>
								<p>Manage student fees</p>
							</div>
						</div>
						<div class="col-md-3">
							<div class="action-card" data-action="assessment">
								<div class="action-icon bg-info">
									<i class="fa fa-clipboard-check"></i>
								</div>
								<h4>Assessments</h4>
								<p>Create & manage exams</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Management Modules -->
				<div class="modules-section">
					<h3 class="section-title">Management Modules</h3>
					<div class="row">
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-primary">
									<i class="fa fa-users"></i>
									<h4>Student Management</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="/app/student">Student Records</a></li>
										<li><a href="/app/student-group">Student Groups</a></li>
										<li><a href="/app/guardian">Guardian Information</a></li>
										<li><a href="/app/student-category">Categories</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-success">
									<i class="fa fa-university"></i>
									<h4>Academic Management</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="/app/program">Programs</a></li>
										<li><a href="/app/course">Courses</a></li>
										<li><a href="/app/instructor">Instructors</a></li>
										<li><a href="/app/course-schedule">Schedules</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-warning">
									<i class="fa fa-rupee-sign"></i>
									<h4>Fee Management</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="/app/fee-structure">Fee Structure</a></li>
										<li><a href="/app/fee-schedule">Fee Schedule</a></li>
										<li><a href="/app/fees">Fee Collection</a></li>
										<li><a href="/app/sales-invoice">Invoices</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-info">
									<i class="fa fa-user-check"></i>
									<h4>Admission Process</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="/app/student-applicant">Applications</a></li>
										<li><a href="/app/student-admission">Admission Portal</a></li>
										<li><a href="/app/program-enrollment">Enrollments</a></li>
										<li><a href="/app/course-enrollment">Course Registration</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-danger">
									<i class="fa fa-calendar-alt"></i>
									<h4>Attendance System</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="/app/student-attendance">Attendance Records</a></li>
										<li><a href="/app/student-attendance-tool">Attendance Tool</a></li>
										<li><a href="#" class="view-report" data-report="Student Monthly Attendance Sheet">Monthly Report</a></li>
										<li><a href="#" class="view-report" data-report="Absent Student Report">Absent Report</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="module-card">
								<div class="module-header bg-gradient-purple">
									<i class="fa fa-chart-line"></i>
									<h4>Reports & Analytics</h4>
								</div>
								<div class="module-body">
									<ul class="module-links">
										<li><a href="#" class="view-report" data-report="Student Fee Collection">Fee Reports</a></li>
										<li><a href="#" class="view-report" data-report="Final Assessment Grades">Grade Reports</a></li>
										<li><a href="/app/student-report-generation-tool">Report Generator</a></li>
										<li><a href="#" class="view-report" data-report="Assessment Plan Status">Assessment Status</a></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Charts Section -->
				<div class="charts-section">
					<h3 class="section-title">Analytics Dashboard</h3>
					<div class="row">
						<div class="col-md-6">
							<div class="chart-container">
								<h4>Enrollment Trends</h4>
								<div id="enrollment-chart"></div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="chart-container">
								<h4>Fee Collection Status</h4>
								<div id="fee-chart"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Activities -->
				<div class="activities-section">
					<h3 class="section-title">Recent Activities</h3>
					<div class="row">
						<div class="col-md-4">
							<div class="activity-card">
								<h4><i class="fa fa-user-plus"></i> Recent Admissions</h4>
								<div id="recent-admissions" class="activity-list"></div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="activity-card">
								<h4><i class="fa fa-clipboard"></i> Upcoming Assessments</h4>
								<div id="upcoming-assessments" class="activity-list"></div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="activity-card">
								<h4><i class="fa fa-money-bill"></i> Recent Fee Collections</h4>
								<div id="recent-fees" class="activity-list"></div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Help Modal -->
				<div class="help-modal" id="helpModal">
					<div class="help-modal-content">
						<div class="help-modal-header">
							<h3><i class="fas fa-life-ring"></i> Help & Support</h3>
							<button class="close-help-modal">&times;</button>
						</div>
						<div class="help-modal-body">
							<div class="help-section">
								<h4>Quick Start Guide</h4>
								<ul>
									<li><i class="fas fa-check"></i> Add new students through Admissions</li>
									<li><i class="fas fa-check"></i> Create programs and courses in Academics</li>
									<li><i class="fas fa-check"></i> Set up fee structures in Finance</li>
									<li><i class="fas fa-check"></i> Track attendance daily</li>
								</ul>
							</div>
							<div class="help-section">
								<h4>Keyboard Shortcuts</h4>
								<div class="shortcut-item">
									<kbd>Ctrl</kbd> + <kbd>N</kbd> - New Admission
								</div>
								<div class="shortcut-item">
									<kbd>Ctrl</kbd> + <kbd>A</kbd> - Mark Attendance
								</div>
								<div class="shortcut-item">
									<kbd>Ctrl</kbd> + <kbd>R</kbd> - View Reports
								</div>
							</div>
							<div class="help-section">
								<h4>Support Contact</h4>
								<p><i class="fas fa-envelope"></i> support@digicampus.edu</p>
								<p><i class="fas fa-phone"></i> +1-234-567-8900</p>
								<p><i class="fas fa-globe"></i> docs.digicampus.edu</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		`).appendTo(this.page.main);

		this.setup_events();
		this.setup_keyboard_shortcuts();
	}

	setup_events() {
		const self = this;
		
		// Navigation Menu
		this.$container.find('.nav-item').on('click', function(e) {
			e.preventDefault();
			$('.nav-item').removeClass('active');
			$(this).addClass('active');
			const section = $(this).data('section');
			self.navigate_to_section(section);
		});
		
		// Help Button
		this.$container.find('.help-btn').on('click', () => {
			$('#helpModal').fadeIn();
		});
		
		// Close Help Modal
		this.$container.find('.close-help-modal').on('click', () => {
			$('#helpModal').fadeOut();
		});
		
		// Click outside modal to close
		$(document).on('click', function(e) {
			if ($(e.target).is('#helpModal')) {
				$('#helpModal').fadeOut();
			}
		});
		
		// Notification Button
		this.$container.find('.notification-btn').on('click', () => {
			frappe.msgprint({
				title: 'Notifications',
				message: `
					<div class="notification-list">
						<div class="notification-item">
							<i class="fas fa-user-plus text-primary"></i>
							<span>3 new admission applications pending</span>
						</div>
						<div class="notification-item">
							<i class="fas fa-dollar-sign text-warning"></i>
							<span>5 students have pending fees</span>
						</div>
						<div class="notification-item">
							<i class="fas fa-calendar text-info"></i>
							<span>Assessment scheduled for tomorrow</span>
						</div>
					</div>
				`,
				indicator: 'blue'
			});
		});
		
		// User Menu
		this.$container.find('.user-menu').on('click', function() {
			frappe.ui.toolbar.toggle_dropdown();
		});
		
		// New Admission Button
		this.$container.find('.new-admission-btn').on('click', () => {
			frappe.new_doc('Student Applicant');
		});
		
		// Mark Attendance Button
		this.$container.find('.mark-attendance-btn').on('click', () => {
			frappe.set_route('Form', 'Student Attendance Tool');
		});
		
		// Collect Fees Button
		this.$container.find('.collect-fees-btn').on('click', () => {
			frappe.new_doc('Fees');
		});

		// Action Cards
		this.$container.find('.action-card').on('click', function() {
			const action = $(this).data('action');
			switch(action) {
				case 'student-admission':
					frappe.set_route('List', 'Student Applicant');
					break;
				case 'mark-attendance':
					frappe.set_route('Form', 'Student Attendance Tool');
					break;
				case 'fee-collection':
					frappe.set_route('List', 'Fees');
					break;
				case 'assessment':
					frappe.set_route('List', 'Assessment Plan');
					break;
			}
		});

		// Report Links
		this.$container.find('.view-report').on('click', function(e) {
			e.preventDefault();
			const report = $(this).data('report');
			frappe.set_route('query-report', report);
		});
	}
	
	setup_keyboard_shortcuts() {
		const self = this;
		$(document).on('keydown', function(e) {
			// Ctrl + N: New Admission
			if (e.ctrlKey && e.key === 'n') {
				e.preventDefault();
				frappe.new_doc('Student Applicant');
			}
			// Ctrl + A: Mark Attendance
			else if (e.ctrlKey && e.key === 'a') {
				e.preventDefault();
				frappe.set_route('Form', 'Student Attendance Tool');
			}
			// Ctrl + R: View Reports
			else if (e.ctrlKey && e.key === 'r') {
				e.preventDefault();
				frappe.set_route('query-report', 'Student Fee Collection');
			}
			// Escape: Close Help Modal
			else if (e.key === 'Escape') {
				$('#helpModal').fadeOut();
			}
		});
	}
	
	navigate_to_section(section) {
		switch(section) {
			case 'dashboard':
				// Already on dashboard, refresh data
				this.refresh();
				break;
			case 'admissions':
				frappe.set_route('List', 'Student Applicant');
				break;
			case 'academics':
				frappe.set_route('List', 'Program');
				break;
			case 'finance':
				frappe.set_route('List', 'Fee Structure');
				break;
			case 'reports':
				frappe.set_route('query-report', 'Student Fee Collection');
				break;
			case 'settings':
				frappe.set_route('Form', 'Education Settings');
				break;
		}
	}

	refresh() {
		this.load_dashboard_data();
		this.load_charts();
		this.load_recent_activities();
	}

	load_dashboard_data() {
		frappe.call({
			method: 'education.education.page.digi_campus.digi_campus.get_dashboard_data',
			callback: (r) => {
				if (r.message) {
					const data = r.message;
					
					// Update stats
					$('#total-students').text(data.total_students || 0);
					$('#new-students').text(data.new_admissions_month || 0);
					$('#total-programs').text(data.total_programs || 0);
					$('#total-courses').text(data.active_courses || 0);
					$('#attendance-percentage').text((data.attendance_percentage || 0) + '%');
					$('#students-marked').text(data.todays_attendance || 0);
					$('#pending-fees').text(frappe.format_currency(data.pending_fees || 0));
					$('#collected-fees').text(frappe.format_currency(data.collected_fees || 0));
				}
			}
		});
	}

	load_charts() {
		// Enrollment Chart
		frappe.call({
			method: 'education.education.page.digi_campus.digi_campus.get_enrollment_chart_data',
			callback: (r) => {
				if (r.message) {
					const chart = new frappe.Chart('#enrollment-chart', {
						data: r.message,
						type: 'line',
						height: 300,
						colors: ['#667eea'],
						lineOptions: {
							regionFill: 1
						}
					});
				}
			}
		});

		// Fee Status Chart
		frappe.call({
			method: 'education.education.page.digi_campus.digi_campus.get_fee_status_chart_data',
			callback: (r) => {
				if (r.message) {
					const chart = new frappe.Chart('#fee-chart', {
						data: r.message,
						type: 'donut',
						height: 300,
						colors: ['#7CD197', '#FF9F40']
					});
				}
			}
		});
	}

	load_recent_activities() {
		frappe.call({
			method: 'education.education.page.digi_campus.digi_campus.get_dashboard_data',
			callback: (r) => {
				if (r.message) {
					const data = r.message;
					
					// Recent Admissions
					if (data.recent_admissions) {
						const admissionsHtml = data.recent_admissions.map(student => `
							<div class="activity-item">
								<div class="activity-title">${student.student_name}</div>
								<div class="activity-meta">
									<span class="text-muted">${student.program || 'No Program'}</span>
									<span class="text-muted">${frappe.datetime.prettyDate(student.admission_date)}</span>
								</div>
							</div>
						`).join('');
						$('#recent-admissions').html(admissionsHtml || '<p class="text-muted">No recent admissions</p>');
					}

					// Upcoming Assessments
					if (data.upcoming_assessments) {
						const assessmentsHtml = data.upcoming_assessments.map(assessment => `
							<div class="activity-item">
								<div class="activity-title">${assessment.course}</div>
								<div class="activity-meta">
									<span class="text-muted">${assessment.student_group}</span>
									<span class="text-muted">${frappe.datetime.str_to_user(assessment.schedule_date)}</span>
								</div>
							</div>
						`).join('');
						$('#upcoming-assessments').html(assessmentsHtml || '<p class="text-muted">No upcoming assessments</p>');
					}

					// Recent Fee Collections
					if (data.recent_fee_collections) {
						const feesHtml = data.recent_fee_collections.map(fee => `
							<div class="activity-item">
								<div class="activity-title">${fee.student_name}</div>
								<div class="activity-meta">
									<span class="text-success">${frappe.format_currency(fee.paid_amount)}</span>
									<span class="text-muted">${frappe.datetime.prettyDate(fee.posting_date)}</span>
								</div>
							</div>
						`).join('');
						$('#recent-fees').html(feesHtml || '<p class="text-muted">No recent collections</p>');
					}
				}
			}
		});
	}
}
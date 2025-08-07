import frappe
from frappe.utils import getdate, today

@frappe.whitelist()
def get_dashboard_data():
    """Get dashboard data for Digi-Campus page"""
    data = {}
    
    # Get student statistics
    data['total_students'] = frappe.db.count('Student', {'enabled': 1})
    data['new_admissions_month'] = frappe.db.count('Student', {
        'enabled': 1,
        'admission_date': ['>=', getdate(today()).replace(day=1)]
    })
    
    # Get program statistics
    data['total_programs'] = frappe.db.count('Program')
    data['active_courses'] = frappe.db.count('Course')
    
    # Get admission statistics
    data['pending_applications'] = frappe.db.count('Student Applicant', {
        'application_status': 'Applied'
    })
    data['approved_applications'] = frappe.db.count('Student Applicant', {
        'application_status': 'Approved'
    })
    
    # Get attendance statistics
    data['todays_attendance'] = frappe.db.count('Student Attendance', {
        'date': today()
    })
    data['attendance_percentage'] = calculate_attendance_percentage()
    
    # Get fee statistics
    data['pending_fees'] = get_pending_fees()
    data['collected_fees'] = get_collected_fees_month()
    
    # Get instructor statistics
    data['total_instructors'] = frappe.db.count('Instructor', {'status': 'Active'})
    
    # Get recent activities
    data['recent_admissions'] = get_recent_admissions()
    data['upcoming_assessments'] = get_upcoming_assessments()
    data['recent_fee_collections'] = get_recent_fee_collections()
    
    return data

def calculate_attendance_percentage():
    """Calculate today's attendance percentage"""
    total_students = frappe.db.count('Student', {'enabled': 1})
    if total_students == 0:
        return 0
        
    present_today = frappe.db.count('Student Attendance', {
        'date': today(),
        'status': 'Present'
    })
    
    return round((present_today / total_students) * 100, 2) if total_students > 0 else 0

def get_pending_fees():
    """Get total pending fees amount"""
    result = frappe.db.sql("""
        SELECT SUM(outstanding_amount) as total
        FROM `tabFees`
        WHERE outstanding_amount > 0
        AND docstatus = 1
    """, as_dict=True)
    
    return result[0].total if result and result[0].total else 0

def get_collected_fees_month():
    """Get fees collected this month"""
    result = frappe.db.sql("""
        SELECT SUM(paid_amount) as total
        FROM `tabFees`
        WHERE MONTH(posting_date) = MONTH(CURDATE())
        AND YEAR(posting_date) = YEAR(CURDATE())
        AND docstatus = 1
    """, as_dict=True)
    
    return result[0].total if result and result[0].total else 0

def get_recent_admissions(limit=5):
    """Get recently admitted students"""
    return frappe.db.get_all('Student',
        filters={'enabled': 1},
        fields=['name', 'student_name', 'admission_date', 'program'],
        order_by='admission_date desc',
        limit=limit
    )

def get_upcoming_assessments(limit=5):
    """Get upcoming assessment plans"""
    return frappe.db.get_all('Assessment Plan',
        filters={
            'schedule_date': ['>=', today()],
            'docstatus': ['!=', 2]
        },
        fields=['name', 'course', 'student_group', 'schedule_date'],
        order_by='schedule_date asc',
        limit=limit
    )

def get_recent_fee_collections(limit=5):
    """Get recent fee collections"""
    return frappe.db.get_all('Fees',
        filters={'docstatus': 1},
        fields=['name', 'student_name', 'paid_amount', 'posting_date'],
        order_by='posting_date desc',
        limit=limit
    )

@frappe.whitelist()
def get_enrollment_chart_data():
    """Get enrollment trends for the last 12 months"""
    from frappe.utils import add_months
    
    data = []
    labels = []
    current_date = getdate(today())
    
    for i in range(11, -1, -1):
        month_date = add_months(current_date, -i)
        month_start = month_date.replace(day=1)
        month_end = add_months(month_start, 1)
        
        count = frappe.db.count('Program Enrollment', {
            'enrollment_date': ['between', [month_start, month_end]]
        })
        
        data.append(count)
        labels.append(month_start.strftime('%b %Y'))
    
    return {
        'labels': labels,
        'datasets': [{
            'name': 'Enrollments',
            'values': data
        }]
    }

@frappe.whitelist()
def get_fee_status_chart_data():
    """Get fee collection status data"""
    collected = frappe.db.sql("""
        SELECT SUM(paid_amount) as total
        FROM `tabFees`
        WHERE docstatus = 1
    """)[0][0] or 0
    
    pending = frappe.db.sql("""
        SELECT SUM(outstanding_amount) as total
        FROM `tabFees`
        WHERE outstanding_amount > 0
        AND docstatus = 1
    """)[0][0] or 0
    
    return {
        'labels': ['Collected', 'Pending'],
        'datasets': [{
            'values': [collected, pending]
        }]
    }

@frappe.whitelist()
def get_quick_stats():
    """Get quick statistics for the dashboard"""
    return {
        'students': {
            'total': frappe.db.count('Student', {'enabled': 1}),
            'new_this_month': frappe.db.count('Student', {
                'enabled': 1,
                'admission_date': ['>=', getdate(today()).replace(day=1)]
            })
        },
        'instructors': {
            'total': frappe.db.count('Instructor', {'status': 'Active'}),
            'on_leave': frappe.db.count('Instructor', {'status': 'On Leave'})
        },
        'programs': {
            'total': frappe.db.count('Program'),
            'enrollments': frappe.db.count('Program Enrollment', {'docstatus': 1})
        },
        'attendance': {
            'today': calculate_attendance_percentage(),
            'marked': frappe.db.count('Student Attendance', {'date': today()})
        }
    }
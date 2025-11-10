// Sample student data for SQL practice
const students = [
    { id: 1, name: "Alice Johnson", grade: 95, major: "Computer Science" },
    { id: 2, name: "Bob Smith", grade: 87, major: "Mathematics" },
    { id: 3, name: "Carol Davis", grade: 92, major: "Engineering" },
    { id: 4, name: "David Wilson", grade: 78, major: "Computer Science" },
    { id: 5, name: "Eve Martinez", grade: 94, major: "Mathematics" },
    { id: 6, name: "Frank Brown", grade: 82, major: "Engineering" }
];

// ===== SQL Practice Tool =====
if (document.getElementById('runQueryBtn')) {
    const runQueryBtn = document.getElementById('runQueryBtn');
    const sqlQueryInput = document.getElementById('sqlQuery');
    const queryResultDiv = document.getElementById('queryResult');
    
    // Load suggested query into editor
    const queryButtons = document.querySelectorAll('.query-btn');
    queryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            sqlQueryInput.value = query;
        });
    });
    
    // Execute SQL query
    runQueryBtn.addEventListener('click', function() {
        const query = sqlQueryInput.value.trim();
        
        if (!query) {
            showResult(false, 'Please enter a SQL query.');
            return;
        }
        
        try {
            const result = executeQuery(query);
            showResult(true, 'Query executed successfully!', result);
        } catch (error) {
            showResult(false, error.message);
        }
    });
}

// Simple SQL query parser
function executeQuery(query) {
    query = query.trim().toLowerCase();
    
    // Only allow SELECT statements
    if (!query.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed in this practice tool.');
    }
    
    // Remove semicolon if present
    query = query.replace(/;$/, '');
    
    // Parse SELECT clause
    const selectMatch = query.match(/select\s+(.+?)\s+from/);
    if (!selectMatch) {
        throw new Error('Invalid SELECT query. Format: SELECT columns FROM students');
    }
    
    const selectClause = selectMatch[1].trim();
    let columns;
    
    if (selectClause === '*') {
        columns = ['id', 'name', 'grade', 'major'];
    } else {
        columns = selectClause.split(',').map(col => col.trim());
    }
    
    // Start with all students
    let results = [...students];
    
    // Parse WHERE clause
    const whereMatch = query.match(/where\s+(.+?)(?:\s+order\s+by|$)/);
    if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        results = filterResults(results, whereClause);
    }
    
    // Parse ORDER BY clause
    const orderMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/);
    if (orderMatch) {
        const orderCol = orderMatch[1];
        const orderDir = orderMatch[2] || 'asc';
        results = sortResults(results, orderCol, orderDir);
    }
    
    // Select only requested columns
    results = results.map(row => {
        const newRow = {};
        columns.forEach(col => {
            if (row.hasOwnProperty(col)) {
                newRow[col] = row[col];
            }
        });
        return newRow;
    });
    
    return { columns, rows: results };
}

// Filter results based on WHERE clause
function filterResults(data, whereClause) {
    // Handle AND conditions
    const conditions = whereClause.split(/\s+and\s+/);
    
    return data.filter(row => {
        return conditions.every(condition => {
            // Parse condition (column operator value)
            const match = condition.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*(.+)/);
            if (!match) return true;
            
            const [, col, operator, rawValue] = match;
            let value = rawValue.trim();
            
            // Remove quotes from string values
            if (value.startsWith("'") || value.startsWith('"')) {
                value = value.slice(1, -1);
            } else {
                // Try to parse as number
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    value = num;
                }
            }
            
            const rowValue = row[col];
            
            switch (operator) {
                case '=':
                    return rowValue == value;
                case '>':
                    return rowValue > value;
                case '<':
                    return rowValue < value;
                case '>=':
                    return rowValue >= value;
                case '<=':
                    return rowValue <= value;
                case '!=':
                    return rowValue != value;
                default:
                    return true;
            }
        });
    });
}

// Sort results
function sortResults(data, column, direction) {
    return data.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (typeof aVal === 'string') {
            return direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        } else {
            return direction === 'asc'
                ? aVal - bVal
                : bVal - aVal;
        }
    });
}

// Display query results
function showResult(success, message, data = null) {
    const queryResultDiv = document.getElementById('queryResult');
    queryResultDiv.classList.remove('hidden');
    
    if (success) {
        queryResultDiv.className = 'query-result success';
        queryResultDiv.innerHTML = `
            <h3>✓ Query Successful</h3>
            <p>${message}</p>
            ${data ? renderTable(data) : ''}
        `;
    } else {
        queryResultDiv.className = 'query-result error';
        queryResultDiv.innerHTML = `
            <h3>✗ Query Error</h3>
            <p>${message}</p>
        `;
    }
}

// Render data table
function renderTable(data) {
    if (!data.rows || data.rows.length === 0) {
        return '<p>No results found.</p>';
    }
    
    let html = '<div class="table-container"><table class="data-table"><thead><tr>';
    
    // Table headers
    data.columns.forEach(col => {
        html += `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Table rows
    data.rows.forEach(row => {
        html += '<tr>';
        data.columns.forEach(col => {
            html += `<td>${row[col] !== undefined ? row[col] : ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}

// ===== Contact Form Validation =====
if (document.getElementById('contactForm')) {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        let isValid = true;
        
        // Validate name
        if (name.length < 2) {
            document.getElementById('nameError').textContent = 'Name must be at least 2 characters.';
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address.';
            isValid = false;
        }
        
        // Validate subject
        if (subject.length < 3) {
            document.getElementById('subjectError').textContent = 'Subject must be at least 3 characters.';
            isValid = false;
        }
        
        // Validate message
        if (message.length < 10) {
            document.getElementById('messageError').textContent = 'Message must be at least 10 characters.';
            isValid = false;
        }
        
        if (isValid) {
            // Simulate form submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            setTimeout(() => {
                // Hide form and show success message
                contactForm.querySelectorAll('.form-group').forEach(group => group.style.display = 'none');
                submitBtn.style.display = 'none';
                formSuccess.classList.remove('hidden');
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.querySelectorAll('.form-group').forEach(group => group.style.display = 'block');
                    submitBtn.style.display = 'inline-flex';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                    formSuccess.classList.add('hidden');
                }, 5000);
            }, 1000);
        }
    });
}

// ===== Active Navigation Link =====
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

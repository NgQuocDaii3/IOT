
        // Dữ liệu mẫu
        const data = [];
        for (let i = 1; i <= 100; i++) {
            data.push({
                id: i,
                device: i % 3 === 0 ? 'Điều hòa' : i % 2 === 0 ? 'Quạt' : 'Đèn',
                action: i % 2 === 0 ? 'Bật' : 'Tắt',
                time: `2024-08-27 12:${i < 10 ? '0' + i : i}:00`
            });
        }

        const rowsPerPage = 20;
    const numPages = Math.ceil(data.length / rowsPerPage);

    function renderTable(page) {
        const start = (page - 1) * rowsPerPage;
        const end = Math.min(start + rowsPerPage, data.length);
        const tbody = document.getElementById('data-body');
        tbody.innerHTML = '';
        for (let i = start; i < end; i++) {
            const row = `<tr>
                <td>${data[i].id}</td>
                <td>${data[i].device}</td>
                <td>${data[i].action}</td>
                
                <td>${data[i].time}</td>
            </tr>`;
            tbody.innerHTML += row;
        }
    }

    function renderPagination() {
        const pagination = document.querySelector('.pagination');
        pagination.innerHTML = '';
        for (let i = 1; i <= numPages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item';
            if (i === 1) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', function() {
                document.querySelectorAll('.page-item').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                renderTable(i);
            });
            pagination.appendChild(li);
        }
    }

    renderTable(1);
    renderPagination();
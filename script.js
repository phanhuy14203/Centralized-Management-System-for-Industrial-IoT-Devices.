// import Chart from 'chart.js/auto'
async function fetchCameraConfigurations() {
  try {
    const response = await fetch('/cameras'); // Gọi API /cameras
    if (!response.ok) {
      throw new Error('Failed to fetch camera configurations.');
    }
    const cameras = await response.json(); // API trả về danh sách camera (mảng)

    const tableBody = document.getElementById('camera-table-body');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    cameras.forEach((config, index) => {
      const row = document.createElement('tr');

      // Cột STT
      const sttCell = document.createElement('td');
      sttCell.textContent = index + 1;
      row.appendChild(sttCell);

      // Cột Camera (Chuyển IdCam thành nút)
      const cameraCell = document.createElement('td');
      const cameraButton = document.createElement('button');
      cameraButton.textContent = config.IdCam || 'N/A'; // Sử dụng IdCam từ API
      cameraButton.onclick = () => fetchImageProcessed(config.IdCam); // Mở modal khi nhấn nút
      cameraCell.appendChild(cameraButton);
      row.appendChild(cameraCell);

      // Cột Vị trí
      const locationCell = document.createElement('td');
      locationCell.textContent = config.Location || 'N/A'; // Sử dụng Location từ API
      row.appendChild(locationCell);

      // Cột Thông tin cấu hình
      const configCell = document.createElement('td');
      const viewButton = document.createElement('button');
      viewButton.textContent = 'XEM';
      viewButton.onclick = () => viewConfiguration(config); // Mở modal khi nhấn nút
      configCell.appendChild(viewButton);
      row.appendChild(configCell);

      // Thêm hàng vào bảng
      tableBody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error fetching camera configurations:', error);
  }
}

function viewConfiguration(config) {
  const modal = document.getElementById('readAreaModal');
  const tableBody = document.getElementById('readAreaTableBody');
  tableBody.innerHTML = ''; // Xóa nội dung cũ

  config.ReadArea.forEach((area, index) => {
    const row = document.createElement('tr');

    // STT
    const sttCell = document.createElement('td');
    sttCell.textContent = index + 1;
    row.appendChild(sttCell);

    // Key
    const keyCell = document.createElement('td');
    keyCell.textContent = area.Key || 'N/A';
    row.appendChild(keyCell);

    // X
    const xCell = document.createElement('td');
    xCell.textContent = area.X || 'N/A';
    row.appendChild(xCell);

    // Y
    const yCell = document.createElement('td');
    yCell.textContent = area.Y || 'N/A';
    row.appendChild(yCell);

    // Height
    const heightCell = document.createElement('td');
    heightCell.textContent = area.Height || 'N/A';
    row.appendChild(heightCell);

    // Width
    const widthCell = document.createElement('td');
    widthCell.textContent = area.Width || 'N/A';
    row.appendChild(widthCell);

    // ReadMode
    const readModeCell = document.createElement('td');
    readModeCell.textContent = area.ReadMode || 'N/A';
    row.appendChild(readModeCell);

    // Thêm hàng vào bảng
    tableBody.appendChild(row);
  });

  // Thêm tên camera vào tiêu đề modal
  modal.querySelector('h2').textContent = `THÔNG TIN CẤU HÌNH CAMERA ${config.IdCam}`;
  modal.style.display = 'flex'; // Hiển thị modal
}

// function closeModal() {
//   const modal = document.getElementById('readAreaModal');
//   modal.style.display = 'none'; // Ẩn modal
// }

let currentPage = 1;
const itemsPerPage = 10;
let imageProcessed = [];
let idCamGlobal = ''; 
async function fetchImageProcessed(idCam) {
  try {
    const response = await fetch(`/processed/${idCam}`); // Gọi API lấy dữ liệu IMAGE_PROCESSED
    if (!response.ok) {
      throw new Error('Failed to fetch IMAGE_PROCESSED data.');
    }

    imageProcessed = await response.json(); // Lấy dữ liệu (mảng)
    idCamGlobal = idCam; 
    // Sắp xếp mảng theo trường ReadingTime (thời gian đọc)
    imageProcessed.sort((a, b) => new Date(b.ReadingTime) - new Date(a.ReadingTime)); // Sắp xếp theo thời gian giảm dần

    // Hiển thị dữ liệu trang đầu tiên
    displayPage(currentPage);

    // Hiển thị modal và thêm tên camera vào tiêu đề
    const modal = document.getElementById('imageProcessedModal');
    modal.querySelector('h2').textContent = `HÌNH ẢNH ĐÃ XỬ LÝ ${idCam}`;
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error fetching IMAGE_PROCESSED data:', error);
  }
}

// Hàm hiển thị ảnh phóng to
function zoomImage(src) {
  const zoomedImage = document.getElementById('zoomed-image');
  const overlay = document.getElementById('zoomed-overlay');
  zoomedImage.src = src;
  zoomedImage.style.display = 'block';
  overlay.style.display = 'block';
}

// Hàm đóng ảnh phóng to
function closeZoomedImage() {
  const zoomedImage = document.getElementById('zoomed-image');
  const overlay = document.getElementById('zoomed-overlay');
  zoomedImage.style.display = 'none';
  overlay.style.display = 'none';
}

// Cập nhật các ảnh trong bảng và modal để kích hoạt phóng to
function updateImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.onclick = () => zoomImage(img.src);
  });
}

function displayPage(page) {
  const tableBody = document.getElementById('imageProcessedTableBody');
  tableBody.innerHTML = ''; // Xóa nội dung cũ

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = imageProcessed.slice(startIndex, endIndex);

  pageData.forEach((image, index) => {
    const row = document.createElement('tr');

    // STT
    const sttCell = document.createElement('td');
    sttCell.textContent = startIndex + index + 1;
    row.appendChild(sttCell);

    // Thời gian
    const timeCell = document.createElement('td');
    timeCell.textContent = image.ReadingTime || 'N/A';
    row.appendChild(timeCell);

    // Read Value - Hiển thị nút XEM
    const readValueCell = document.createElement('td');
    const readValueButton = document.createElement('button');
    readValueButton.textContent = 'XEM'; // Nội dung nút
    readValueButton.onclick = () => {
      viewReadValue(image.ReadValue);
    };
    readValueCell.appendChild(readValueButton);
    row.appendChild(readValueCell);

    // Ảnh
    const imageCell = document.createElement('td');
    const imgElement = document.createElement('img');

    // Đặt src cho ảnh từ API dựa trên IdImage
    imgElement.src = `/viewImage/${image.IdImage}`;  // Dùng IdImage để gọi API
    imgElement.alt = 'Processed Image';
    imgElement.style.maxWidth = '100px'; // Đặt kích thước ảnh
    imgElement.style.maxHeight = '100px';

    imageCell.appendChild(imgElement);
    row.appendChild(imageCell);

    // Thêm hàng vào bảng
    tableBody.appendChild(row);
  });

  // Cập nhật nút chuyển trang
  updatePagination();
  updateImages();
}

function changePage(direction) {
  const totalPages = Math.ceil(imageProcessed.length / itemsPerPage);
  currentPage += direction;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  displayPage(currentPage);
}

function updatePagination() {
  const totalPages = Math.ceil(imageProcessed.length / itemsPerPage);
  
  // Cập nhật trạng thái nút "Trước"
  document.getElementById('prevPage').disabled = currentPage === 1;

  // Cập nhật trạng thái nút "Sau"
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// function closeImageModal() {
//   const modal = document.getElementById('imageProcessedModal');
//   modal.style.display = 'none'; // Ẩn modal
// }

// Hàm hiển thị modal cho Read Value
function viewReadValue(readValue) {
  const modal = document.getElementById('readValueModal');
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = ''; // Xóa nội dung cũ

  // Tạo bảng dữ liệu Read Value
  const table = document.createElement('table');
  table.classList.add('table', 'table-striped'); // Thêm class để làm đẹp bảng

  // Tạo header của bảng
  const tableHead = document.createElement('thead');
  const headRow = document.createElement('tr');

  // Header STT
  const headerSTT = document.createElement('th');
  headerSTT.textContent = 'STT';
  headRow.appendChild(headerSTT);

  // Header Key
  const headerKey = document.createElement('th');
  headerKey.textContent = 'Key';
  headRow.appendChild(headerKey);

  // Header Value
  const headerValue = document.createElement('th');
  headerValue.textContent = 'Value';
  headRow.appendChild(headerValue);

  // Header X
  const headerX = document.createElement('th');
  headerX.textContent = 'X';
  headRow.appendChild(headerX);

  // Header Y
  const headerY = document.createElement('th');
  headerY.textContent = 'Y';
  headRow.appendChild(headerY);

  tableHead.appendChild(headRow);
  table.appendChild(tableHead);

  // Tạo body của bảng
  const tableBody = document.createElement('tbody');
  readValue.forEach((item, index) => {
    const row = document.createElement('tr');

    // Cột STT
    const cellSTT = document.createElement('td');
    cellSTT.textContent = index + 1; // Số thứ tự bắt đầu từ 1
    row.appendChild(cellSTT);

    // Cột Key
    // const cellKey = document.createElement('td');
    // cellKey.textContent = item.Key;
    // row.appendChild(cellKey);
    const cellKey = document.createElement('td');
    const keyButton = document.createElement('button');
    keyButton.textContent = item.Key;
    keyButton.onclick = () => {
      // showKeyChart(idCam, item.Key);
      showKeyData(item.Key);
    };
    cellKey.appendChild(keyButton);
    row.appendChild(cellKey);   

    // Cột Value
    const cellValue = document.createElement('td');
    cellValue.textContent = item.Value;
    row.appendChild(cellValue);

    // Cột X
    const cellX = document.createElement('td');
    cellX.textContent = item.X;
    row.appendChild(cellX);

    // Cột Y
    const cellY = document.createElement('td');
    cellY.textContent = item.Y;
    row.appendChild(cellY);

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  modalBody.appendChild(table);

  // Hiển thị modal
  // modal.style.display = 'block';
  modal.style.display = 'flex';
  modal.scrollIntoView({ behavior: 'smooth' });
  // Đóng modal khi nhấn ra ngoài
  modal.onclick = (event) => {
    if (event.target === modal) { // Kiểm tra nếu nhấn ra ngoài modal
      closeValueModal('readValueModal');
    }
  };
}
// async function showKeyChart(keyData, key) {
//   try {
//     // Chuyển đổi dữ liệu từ mảng 2 chiều thành các mảng labels và values
//     const labels = keyData.map(data => new Date(data.time).toLocaleString('vi-VN', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false,
//       timeZone: 'Asia/Ho_Chi_Minh'
//     }));
//     const values = keyData.map(data => data.value);

//     const ctx = document.getElementById('keyChart').getContext('2d');
//     new Chart(ctx, {
//       type: 'line', // Thay đổi loại biểu đồ thành 'line'
//       data: {
//         labels: labels,
//         datasets: [{
//           label: `Key: ${key}`,
//           data: values,
//           backgroundColor: 'rgba(54, 162, 235, 0.2)',
//           borderColor: 'rgba(54, 162, 235, 1)',
//           borderWidth: 1,
//           fill: false // Không tô màu dưới đường
//         }]
//       },
//       options: {
//         scales: {
//           x: {
//             title: {
//               display: true,
//               text: 'Thời gian'
//             }
//           },
//           y: {
//             title: {
//               display: true,
//               text: 'Giá trị'
//             },
//             beginAtZero: true
//           }
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching key chart data:', error);
//   }
// }
let keyChart;
async function showKeyData(key) {
  try {
    const response = await fetch(`/key-data/${idCamGlobal}/${key}`); // Gọi API để lấy dữ liệu key
    if (!response.ok) {
      throw new Error('Failed to fetch key data.');
    }
    const keyData = await response.json();

    const tableBody = document.getElementById('keyValueTableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    keyData.forEach((item) => {
      const row = document.createElement('tr');

      // Cột Thời gian
      const timeCell = document.createElement('td');
      timeCell.textContent = new Date(item.time).toLocaleString();
      row.appendChild(timeCell);

      // Cột Giá trị
      const valueCell = document.createElement('td');
      valueCell.textContent = item.value;
      row.appendChild(valueCell);

      tableBody.appendChild(row);
    });

    // Hiển thị modal
    const modal = document.getElementById('keyValueModal');
    modal.querySelector('h2').textContent = `KEY ${key}`;
    modal.style.display = 'flex';

    // Đóng modal khi nhấn ra ngoài
    const labels = keyData.map(data => new Date(data.time).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    }));
    const values = keyData.map(data => data.value);
    if (keyChart) {
      keyChart.destroy();
    }
    const ctx = document.getElementById('keyChart').getContext('2d');
    // ctx.innerHTML = '';
    // xóa biểu đồ cũ
    keyChart = new Chart(ctx, {
      type: 'line', // Thay đổi loại biểu đồ thành 'line'
      data: {
        labels: labels,
        datasets: [{
          label: `Key: ${key}`,
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false // Không tô màu dưới đường
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Thời gian'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Giá trị'
            },
            beginAtZero: true
          }
        }
      }
    });
    // cuộn đến vị trí bảng
    modal.scrollIntoView({ behavior: 'smooth' });
    // // Thêm sự kiện cho nút showChart
        // Đóng modal khi nhấn ra ngoài
    modal.onclick = (event) => {
          if (event.target === modal) { // Kiểm tra nếu nhấn ra ngoài modal
            closeValueModal('keyValueModal');
          }
    };
    // document.getElementById('showChartBtn').onclick = () => showKeyChart(keyData, key);
  } catch (error) {
    console.error('Error fetching key data:', error);
  }
}
function closeValueModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
}
function closeImageModal() {
  const modal = document.getElementById('imageProcessedModal');
  modal.style.display = 'none'; // Ẩn modal
}
function closeModal() {
  const modal = document.getElementById('readAreaModal');
  modal.style.display = 'none'; // Ẩn modal
}
// Thêm sự kiện để đóng modal khi nhấn ra ngoài modal
window.onclick = function(event) {
  const modal = document.getElementById('readAreaModal');
  if (event.target === modal) {
    idCamGlobal = '';
    closeModal();
  }
  const imageModal = document.getElementById('imageProcessedModal');
  if (event.target === imageModal) {
    idCamGlobal = '';
    closeImageModal();
  }
  // const chartModal = document.getElementById('chartModal');
  // if (event.target === chartModal) {
  //   chartModal.style.display = 'none';
  // }
  // mới add
  // const chartModal = document.getElementById('chartModal');
  // if (event.target == chartModal) {
  //   chartModal.style.display = 'none';
  // }
}

// Gọi hàm fetch để tải dữ liệu khi trang được load
window.onload = fetchCameraConfigurations;

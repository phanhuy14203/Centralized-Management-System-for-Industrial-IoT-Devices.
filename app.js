const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

// Nạp cấu hình từ .env
dotenv.config();

const app = express();
const port = 3000;

// Lấy các thông tin kết nối từ biến môi trường
const uri = process.env.MONGO_URI || "mongodb://CvisionMongo:HEX4yoGMIVAPCh@45.251.112.69:4140/";

const dbName = process.env.DB_NAME || "AIOT_CAMERA";
const configCollection = process.env.CONFIG_COLLECTION || "CAMERA_CONFIGURATION";
const processCollection = process.env.CONFIG_COLLECTION || "IMAGE_TEXT_DATA"; //IMAGE_PROCESSED
const imageCollection = process.env.CONFIG_COLLECTION || "IMAGE";

// Kết nối MongoDB một lần duy nhất
let client;
async function connectMongoDB() {
    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Kết nối MongoDB thành công!');
    } catch (error) {
        console.error('Lỗi khi kết nối MongoDB:', error);
        process.exit(1);  // Dừng ứng dụng nếu không thể kết nối MongoDB
    }
}

// Gọi hàm kết nối MongoDB khi khởi động server
connectMongoDB();

// Lấy dữ liệu camera
async function getCameraData() {
    const db = client.db(dbName);
    const collection = db.collection(inforCollection);
    return await collection.find({}).toArray();
}

// Lấy dữ liệu cấu hình camera
async function getCameraConfig() {
    const db = client.db(dbName);
    const collection = db.collection(configCollection);
    return await collection.find({}).toArray();
}

// Cung cấp trang HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Cung cấp file script.js
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

// API để lấy dữ liệu camera
app.get('/cameras', async (req, res) => {
    try {
        const cameras = await getCameraConfig() ;
        res.json(cameras);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu camera:', error);
        res.status(500).send({ error: 'Lỗi khi lấy dữ liệu từ MongoDB' });
    }
});

// Lấy dữ liệu processed theo idCam
async function getProcessedDataById(idCam) {
    const db = client.db(dbName);
    const collection = db.collection(processCollection);
    return await collection.find({ CameraStation: idCam }).toArray(); // Truy vấn theo CameraStation
}

// API để lấy dữ liệu processed của camera theo idCam
app.get('/processed/:idCam', async (req, res) => {
    const { idCam } = req.params;

    if (!idCam) {
        return res.status(400).send({ error: 'Tham số idCam là bắt buộc' });
    }

    try {
        const processedData = await getProcessedDataById(idCam);
        if (processedData && processedData.length > 0) {
            res.json(processedData.map(item => ({
                ...item,
                ReadingTime: new Date(item.ReadingTime).toLocaleString(),
            })));
        } else {
            res.status(404).send({ error: `Không tìm thấy dữ liệu cho CameraStation: ${idCam}` });
        }
    } catch (error) {
        console.error('Lỗi truy vấn MongoDB:', error.message);
        res.status(500).send({ error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
});

// Lấy dữ liệu ảnh từ collection image theo IdImage
async function getImageByIdImage(idImage) {
    const db = client.db(dbName);
    const collection = db.collection(imageCollection);
    return await collection.findOne({ _id: new ObjectId(idImage) });  // Truy vấn theo _id
}
// vẽ biểu đồ từ collection key
// app.get('/key-data/:idCam/:key', async (req, res) => {
//     try {
//       const { idCam,key} = req.params;
//       const keyData = await db.collection(processCollection)
//         .find({ IdCam: idCam, Key: key })
//         .sort({ ReadingTime: -1 }) // Sắp xếp theo thời gian giảm dần
//         .limit(10) // Giới hạn kết quả trả về 10 ảnh mới nhất
//         .toArray();
//         const result = keyData.map(doc => {
//             const readValue = doc.ReadValue.find(rv => rv.Key === key);
//             return {
//                 time: doc.ReadingTime,
//                 value: readValue.Value
//             };
//             });
//         res.json(result);   
//     } catch (error) {
//       res.status(500).send('Error fetching key data');
//     }
// });
async function getKeyDataByIdCamAndKey(idCam, key) {
    const db = client.db(dbName);
    const keyData = await db.collection(processCollection)
        .find({
            CameraStation: idCam,
            ReadValue: { $elemMatch: { Key: key } }
        })
        .sort({ ReadingTime: -1 }) // Sắp xếp theo thời gian giảm dần
        .limit(30) // Giới hạn kết quả trả về 10 ảnh mới nhất
        .toArray();

    // Chuyển đổi dữ liệu để chỉ trả về các giá trị cần thiết
    return keyData.map(doc => {
        const readValue = doc.ReadValue.find(rv => rv.Key === key);
        return {
            time: doc.ReadingTime,
            value: readValue.Value
        };
    });
}
app.get('/key-data/:idCam/:key', async (req, res) => {
    try {
        const { idCam, key } = req.params;
        const result = await getKeyDataByIdCamAndKey(idCam, key);
        res.json(result);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu key:', error.message);
        res.status(500).send('Error fetching key data');
    }
});
// app.get('/key-data/:idCam/:key', async (req, res) => {
//     try {
//         const { idCam, key } = req.params;
//         const result = await getKeyDataByIdCamAndKey(idCam, key);
//         res.json(result);
//     } catch (error) {
//         console.error('Lỗi khi lấy dữ liệu key:', error.message);
//         res.status(500).send('Error fetching key data');
//     }
// });
app.get('/viewImage/:idImage', async (req, res) => {
    const { idImage } = req.params;

    if (!idImage) {
        return res.status(400).send({ error: 'Tham số idImage là bắt buộc' });
    }

    try {
        const image = await getImageByIdImage(idImage);

        if (!image) {
            return res.status(404).send({ error: `Không tìm thấy ảnh cho IdImage: ${idImage}` });
        }

        // Kiểm tra xem ảnh có trường 'image' lưu dưới dạng base64 hay không
        if (image.image) {
            res.setHeader('Content-Type', 'image/jpeg'); // Đặt Content-Type là image/jpeg cho ảnh
            const buffer = Buffer.from(image.image, 'base64');  // Chuyển base64 thành buffer
            return res.send(buffer);  // Trả ảnh về client dưới dạng buffer
        } else {
            return res.status(500).send({ error: 'Dữ liệu ảnh không hợp lệ' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu ảnh:', error.message);
        res.status(500).send({ error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});

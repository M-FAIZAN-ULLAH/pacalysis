import React, { useState } from "react";
import { Upload, Button, notification, Spin, Modal, Table, Input } from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  DatabaseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";

const PcapUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urls, setUrls] = useState([]);

  const handleUpload = ({ file }) => {
    if (
      file.type !== "application/vnd.tcpdump.pcap" &&
      !file.name.endsWith(".pcap")
    ) {
      notification.error({
        message: "Invalid file type",
        description: "Please upload a valid .pcap file.",
      });
      return;
    }
    setFile(file);
  };

  const handleView = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/packets/range?id=669a34f8867bc7f321fddbd0&start=58&end=75"
      );
      setTableData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      notification.error({
        message: "Error fetching data",
        description: error.message,
      });
    }
  };

  const handleStoreInDb = async () => {
    if (!file) {
      notification.error({
        message: "No file selected",
        description: "Please upload a .pcap file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("pcapfile", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/pcap/upload",
        formData
      );
      if (response.status === 200) {
        notification.success({
          message: "Upload Successful",
          description:
            "The file has been successfully uploaded and stored in the database.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Upload Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (record) => {
    Modal.info({
      title: "Detailed Information",
      content: (
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      ),
      onOk() {},
    });
  };

  const handleSearch = () => {
    const filtered = tableData.filter(
      (item) =>
        item.info && item.info.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleUrlSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/packets/urls?id=669a34f8867bc7f321fddbd0`
      );
      setUrls(response.data.data);
      setUrlModalVisible(true);
    } catch (error) {
      notification.error({
        message: "Error fetching URLs",
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: "SNO",
      key: "sno",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Arrival Time",
      dataIndex: "arrival_time",
      key: "arrival_time",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "IP Source",
      dataIndex: "details",
      key: "ip_source",
      render: (details) => details?.IP?.src || "N/A",
    },
    {
      title: "IP Destination",
      dataIndex: "details",
      key: "ip_destination",
      render: (details) => details?.IP?.dst || "N/A",
    },
    {
      title: "Length",
      dataIndex: "length",
      key: "length",
    },
    {
      title: "Info",
      dataIndex: "info",
      key: "info",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button onClick={() => handleDetailsClick(record)}>Details</Button>
      ),
    },
  ];

  return (
    <div>
      <Upload.Dragger
        accept=".pcap"
        customRequest={({ file, onSuccess }) => {
          onSuccess("ok");
          handleUpload({ file });
        }}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Only .pcap files are supported</p>
      </Upload.Dragger>

      <Button
        type="primary"
        icon={<DatabaseOutlined />}
        onClick={handleStoreInDb}
        style={{ marginTop: 16 }}
      >
        Store in DB
      </Button>

      <Button
        type="primary"
        icon={<EyeOutlined />}
        onClick={handleView}
        style={{ marginTop: 16, marginLeft: 16 }}
      >
        View
      </Button>

      <Spin style={{ marginLeft: "30px" }} spinning={loading} />

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        >
          <Input
            placeholder="Search Info"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            type="default"
            style={{ marginLeft: 16 }}
            onClick={handleUrlSearch}
          >
            Search URLs
          </Button>
        </div>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        expandable={{
          expandedRowRender: (record) => (
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(record, null, 2)}
            </pre>
          ),
        }}
      />

      <Modal
        title="Found URLs"
        visible={urlModalVisible}
        onCancel={() => setUrlModalVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          dataSource={urls}
          columns={[
            {
              title: "SNO",
              key: "sno",
              render: (text, record, index) => index + 1,
            },
            {
              title: "URL",
              dataIndex: "url",
              key: "url",
              render: (url) => (
                <a
                  href={`http://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              ),
            },
            {
              title: "Object Number",
              dataIndex: "objectNumber",
              key: "objectNumber",
            },
          ]}
          rowKey={(record) => record.url + record.objectNumber}
        />
      </Modal>
    </div>
  );
};

export default PcapUpload;

///////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import {
//   Upload,
//   Button,
//   notification,
//   Spin,
//   Modal,
//   Table,
//   Input,
//   Image,
// } from "antd";
// import {
//   UploadOutlined,
//   EyeOutlined,
//   DatabaseOutlined,
//   SearchOutlined,
//   DeleteOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import Flags from "react-world-flags";

// const IP_COUNTRY_FLAGS = {
//   US: "us",
//   CA: "ca",
//   GB: "gb",
//   DE: "de",
//   FR: "fr",
//   // Add other countries and their flags as needed
// };

// const PcapUpload = () => {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [visible, setVisible] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [urlModalVisible, setUrlModalVisible] = useState(false);
//   const [urls, setUrls] = useState([]);
//   const [fileName, setFileName] = useState("");

//   const handleUpload = ({ file }) => {
//     if (
//       file.type !== "application/vnd.tcpdump.pcap" &&
//       !file.name.endsWith(".pcap")
//     ) {
//       notification.error({
//         message: "Invalid file type",
//         description: "Please upload a valid .pcap file.",
//       });
//       return;
//     }
//     setFile(file);
//     setFileName(file.name);
//   };

//   const handleView = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:5000/api/packets/range?id=669a34f8867bc7f321fddbd0&start=58&end=75"
//       );
//       setTableData(response.data.data);
//       setFilteredData(response.data.data);
//     } catch (error) {
//       notification.error({
//         message: "Error fetching data",
//         description: error.message,
//       });
//     }
//   };

//   const handleStoreInDb = async () => {
//     if (!file) {
//       notification.error({
//         message: "No file selected",
//         description: "Please upload a .pcap file first.",
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("pcapfile", file);

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/pcap/upload",
//         formData
//       );
//       if (response.status === 200) {
//         notification.success({
//           message: "Upload Successful",
//           description:
//             "The file has been successfully uploaded and stored in the database.",
//         });
//       }
//     } catch (error) {
//       notification.error({
//         message: "Upload Failed",
//         description: error.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDetailsClick = (record) => {
//     Modal.info({
//       title: "Detailed Information",
//       content: (
//         <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
//           {JSON.stringify(record, null, 2)}
//         </pre>
//       ),
//       onOk() {},
//     });
//   };

//   const handleSearch = () => {
//     const filtered = tableData.filter(
//       (item) =>
//         item.info && item.info.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredData(filtered);
//   };

//   const handleUrlSearch = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:5000/api/packets/urls?id=669a34f8867bc7f321fddbd0"
//       );
//       setUrls(response.data.data);
//       setUrlModalVisible(true);
//     } catch (error) {
//       notification.error({
//         message: "Error fetching URLs",
//         description: error.message,
//       });
//     }
//   };

//   const getCountryFromIP = async (ip) => {
//     const url = `https://ipinfo.io/${ip}/json?token=bdbe5ec589e15b`;

//     try {
//       const response = await axios.get(url);
//       const countryCode = response.data.country;
//       return countryCode || "US"; // Default to 'US' if no country code is found
//     } catch (error) {
//       console.error("Error fetching IP information:", error);
//       return "US"; // Default to 'US' in case of an error
//     }
//   };

//   const getFlag = (countryCode) => {
//     return IP_COUNTRY_FLAGS[countryCode] || "unknown";
//   };

//   const columns = [
//     {
//       title: "SNO",
//       key: "sno",
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "Time",
//       dataIndex: "time",
//       key: "time",
//     },
//     {
//       title: "Arrival Time",
//       dataIndex: "arrival_time",
//       key: "arrival_time",
//     },
//     {
//       title: "Source",
//       dataIndex: "source",
//       key: "source",
//     },
//     {
//       title: "Destination",
//       dataIndex: "destination",
//       key: "destination",
//     },
//     {
//       title: "IP Source",
//       dataIndex: "details",
//       key: "ip_source",
//       render: (details) => {
//         const ip = details?.IP?.src || "N/A";
//         const countryCode = getCountryFromIP(ip);
//         return (
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <span>{ip}</span>
//             <Flags
//               code={getFlag(countryCode)}
//               style={{ marginLeft: 8, width: 20, height: 15 }}
//             />
//           </div>
//         );
//       },
//     },
//     {
//       title: "IP Destination",
//       dataIndex: "details",
//       key: "ip_destination",
//       render: (details) => {
//         const ip = details?.IP?.dst || "N/A";
//         const countryCode = getCountryFromIP(ip);
//         return (
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <span>{ip}</span>
//             <Flags
//               code={getFlag(countryCode)}
//               style={{ marginLeft: 8, width: 20, height: 15 }}
//             />
//           </div>
//         );
//       },
//     },
//     {
//       title: "Length",
//       dataIndex: "length",
//       key: "length",
//     },
//     {
//       title: "Info",
//       dataIndex: "info",
//       key: "info",
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (text, record) => (
//         <Button onClick={() => handleDetailsClick(record)}>Details</Button>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <Upload.Dragger
//         accept=".pcap"
//         customRequest={({ file, onSuccess }) => {
//           onSuccess("ok");
//           handleUpload({ file });
//         }}
//         showUploadList={false}
//       >
//         <p className="ant-upload-drag-icon">
//           <UploadOutlined />
//         </p>
//         <p className="ant-upload-text">
//           Click or drag file to this area to upload
//         </p>
//         <p className="ant-upload-hint">Only .pcap files are supported</p>
//       </Upload.Dragger>

//       <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
//         {file && (
//           <>
//             <span style={{ marginRight: 16 }}>{fileName}</span>
//             <Button
//               icon={<DeleteOutlined />}
//               onClick={() => setFile(null)}
//               style={{ marginRight: 16 }}
//             >
//               Delete
//             </Button>
//           </>
//         )}
//       </div>

//       <Button
//         type="primary"
//         icon={<DatabaseOutlined />}
//         onClick={handleStoreInDb}
//         style={{ marginTop: 16 }}
//       >
//         Store in DB
//       </Button>

//       <Button
//         type="primary"
//         icon={<EyeOutlined />}
//         onClick={handleView}
//         style={{ marginTop: 16, marginLeft: 16 }}
//       >
//         View
//       </Button>

//       <Spin style={{ marginLeft: "30px" }} spinning={loading} />

//       <div style={{ marginTop: 20, marginBottom: 20 }}>
//         <div
//           style={{
//             marginBottom: 16,
//             padding: 10,
//             border: "1px solid #ddd",
//             borderRadius: 4,
//           }}
//         >
//           <Input
//             placeholder="Search Info"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ width: 200, marginRight: 16 }}
//           />
//           <Button
//             type="primary"
//             icon={<SearchOutlined />}
//             onClick={handleSearch}
//           >
//             Search
//           </Button>
//           <Button
//             type="default"
//             style={{ marginLeft: 16 }}
//             onClick={handleUrlSearch}
//           >
//             Search URLs
//           </Button>
//         </div>
//       </div>

//       <Table
//         dataSource={filteredData}
//         columns={columns}
//         rowKey="_id"
//         expandable={{
//           expandedRowRender: (record) => (
//             <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
//               {JSON.stringify(record, null, 2)}
//             </pre>
//           ),
//         }}
//       />

//       <Modal
//         title="Found URLs"
//         visible={urlModalVisible}
//         onCancel={() => setUrlModalVisible(false)}
//         footer={null}
//         width={600}
//       >
//         <Table
//           dataSource={urls}
//           columns={[
//             { title: "URL", dataIndex: "url", key: "url" },
//             {
//               title: "Description",
//               dataIndex: "description",
//               key: "description",
//             },
//           ]}
//           rowKey="url"
//         />
//       </Modal>
//     </div>
//   );
// };

// export default PcapUpload;

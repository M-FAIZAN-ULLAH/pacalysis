import React, { useState } from "react";
import { Upload, Button, notification, Spin, Modal, Table, Input } from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  DatabaseOutlined,
  SearchOutlined,
  DeleteOutlined,
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
  const [ipFilter, setIpFilter] = useState("");

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

  const handleUrlClick = (objectNumber) => {
    const filtered = tableData.filter(
      (item, index) => index + 1 === objectNumber
    );
    setFilteredData(filtered);
    setUrlModalVisible(false);
  };

  const handleIpFilterChange = (e) => {
    const value = e.target.value;
    setIpFilter(value);
    const filtered = tableData.filter(
      (item) =>
        item.source.includes(value) ||
        item.destination.includes(value) ||
        (item.details?.IP?.src || "").includes(value) ||
        (item.details?.IP?.dst || "").includes(value)
    );
    setFilteredData(filtered);
  };

  const handleDeleteFile = () => {
    setFile(null);
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
        disabled={loading}
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

      {file && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "700px",
            marginBottom: "10",
          }}
        >
          <span style={{ marginRight: 16 }}>{file.name}</span>
          <Button icon={<DeleteOutlined />} onClick={handleDeleteFile} danger />
        </div>
      )}

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
          <Input
            placeholder="Filter by IP"
            value={ipFilter}
            onChange={handleIpFilterChange}
            style={{ width: 200, marginLeft: 16 }}
          />
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
                <a onClick={() => handleUrlClick(url.objectNumber)}>{url}</a>
              ),
            },
            {
              title: "Object Number",
              dataIndex: "objectNumber",
              key: "objectNumber",
            },
          ]}
          rowKey="objectNumber"
        />
      </Modal>
    </div>
  );
};

export default PcapUpload;

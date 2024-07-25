import React, { useState } from "react";
import {
  Upload,
  Button,
  notification,
  Spin,
  Modal,
  Table,
  Input,
  Descriptions,
  Collapse,
  Typography,
  Divider,
  Card,
  Form,
  message,
} from "antd";
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
  const { Panel } = Collapse;
  const { Title, Paragraph, Text } = Typography;

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
        "http://localhost:5000/api/packets/range?id=669a34f8867bc7f321fddbd0&start=58&end=70"
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
        <div style={{ width: 1000, maxHeight: "600px", overflowY: "auto" }}>
          <Collapse defaultActiveKey={["1"]} bordered={false}>
            <Collapse.Panel header="General Information" key="1">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Time">
                  {record.time}
                </Descriptions.Item>
                <Descriptions.Item label="Arrival Time">
                  {record.arrival_time}
                </Descriptions.Item>
                <Descriptions.Item label="UTC Arrival Time">
                  {record.UTC_arrival_time}
                </Descriptions.Item>
                <Descriptions.Item label="Frame Number">
                  {record.frame_number || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Protocol in Frame">
                  {record.protocol_in_frame}
                </Descriptions.Item>
                <Descriptions.Item label="Coloring Rule Name">
                  {record.coloring_rule_name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Coloring Rule Strength">
                  {record.coloring_rule_strength || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Source">
                  {record.source}
                </Descriptions.Item>
                <Descriptions.Item label="Destination">
                  {record.destination}
                </Descriptions.Item>
                <Descriptions.Item label="Source Port">
                  {record.source_port}
                </Descriptions.Item>
                <Descriptions.Item label="Destination Port">
                  {record.destination_port}
                </Descriptions.Item>
                <Descriptions.Item label="Length">
                  {record.length}
                </Descriptions.Item>
                <Descriptions.Item label="Info">
                  {record.info}
                </Descriptions.Item>
              </Descriptions>
            </Collapse.Panel>
            <Collapse.Panel header="Ethernet Details" key="2">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Destination">
                  {record.ethernet.dst}
                </Descriptions.Item>
                <Descriptions.Item label="Source">
                  {record.ethernet.src}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {record.ethernet.type}
                </Descriptions.Item>
              </Descriptions>
            </Collapse.Panel>
            <Collapse.Panel header="Additional Details" key="3">
              <Collapse>
                {Object.entries(record.details).map(([protocol, details]) => (
                  <Collapse.Panel header={protocol} key={protocol}>
                    <Descriptions column={2} bordered>
                      {Object.entries(details).map(([key, value]) => (
                        <Descriptions.Item label={key} key={key}>
                          {value !== null ? value.toString() : "N/A"}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Collapse.Panel>
          </Collapse>
        </div>
      ),
      width: 1100,
      bodyStyle: { padding: "20px" }, // Add padding inside the modal
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [aloading, setaLoading] = useState(false);
  const [index, setIndex] = useState("");
  const [showData, setShowData] = useState(false);

  const fetchData = async (index) => {
    setaLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/packets/object?id=669a34f8867bc7f321fddbd0&index=${index}`
      );
      setData(response.data);
      setShowData(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    } finally {
      setaLoading(false);
    }
  };

  const handleIndexSubmit = async () => {
    if (!index) {
      message.error("Please enter an index");
      return;
    }
    await fetchData(index);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setIndex("");
    setShowData(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIndex("");
    setShowData(false);
  };

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
          <Button
            type="default"
            style={{ marginLeft: 16 }}
            onClick={() => setIsModalVisible(true)}
          >
            Find Object
          </Button>
        </div>
      </div>
      <Modal
        title="Object Description"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {!showData ? (
          <Form layout="inline" onFinish={handleIndexSubmit}>
            <Form.Item>
              <Input
                placeholder="Enter index"
                value={index}
                onChange={(e) => setIndex(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        ) : aloading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          data && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Message">
                {data.message}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {data.data.time}
              </Descriptions.Item>
              <Descriptions.Item label="Arrival Time">
                {data.data.arrival_time}
              </Descriptions.Item>
              <Descriptions.Item label="UTC Arrival Time">
                {data.data.UTC_arrival_time}
              </Descriptions.Item>
              <Descriptions.Item label="Frame Number">
                {data.data.frame_number}
              </Descriptions.Item>
              <Descriptions.Item label="Protocol in Frame">
                {data.data.protocol_in_frame}
              </Descriptions.Item>
              <Descriptions.Item label="Coloring Rule Name">
                {data.data.coloring_rule_name}
              </Descriptions.Item>
              <Descriptions.Item label="Coloring Rule Strength">
                {data.data.coloring_rule_strength}
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {data.data.source}
              </Descriptions.Item>
              <Descriptions.Item label="Destination">
                {data.data.destination}
              </Descriptions.Item>
              <Descriptions.Item label="Source Port">
                {data.data.source_port}
              </Descriptions.Item>
              <Descriptions.Item label="Destination Port">
                {data.data.destination_port}
              </Descriptions.Item>
              <Descriptions.Item label="Length">
                {data.data.length}
              </Descriptions.Item>
              <Descriptions.Item label="Info">
                {data.data.info}
              </Descriptions.Item>
              <Descriptions.Item label="Frames">
                {data.data.frames}
              </Descriptions.Item>
              <Descriptions.Item label="Bytes">
                {data.data.bytes}
              </Descriptions.Item>
              <Descriptions.Item label="Header Checksum Status">
                {data.data.header_checksum_status}
              </Descriptions.Item>
              <Descriptions.Item label="Ethernet">
                {data.data.ethernet ? (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Destination">
                      {data.data.ethernet.dst}
                    </Descriptions.Item>
                    <Descriptions.Item label="Source">
                      {data.data.ethernet.src}
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      {data.data.ethernet.type}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  "No data"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Queries">
                {data.data.queries}
              </Descriptions.Item>
              <Descriptions.Item label="Answers">
                {data.data.answers}
              </Descriptions.Item>
              <Descriptions.Item label="Flags">
                {data.data.flags}
              </Descriptions.Item>
              <Descriptions.Item label="Ports">
                {data.data.ports}
              </Descriptions.Item>
              <Descriptions.Item label="Details">
                {data.data.details ? (
                  <Descriptions bordered column={1}>
                    {Object.entries(data.data.details).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey}>
                            {subKey}: {subValue}
                          </div>
                        ))}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  "No data"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="ID">{data.data._id}</Descriptions.Item>
            </Descriptions>
          )
        )}
      </Modal>

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

import React, { useState } from "react";
import {
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
  Form,
  message,
} from "antd";
import {
  EyeOutlined,
  DatabaseOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const PcapViewer = () => {
  const [documentId, setDocumentId] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urls, setUrls] = useState([]);
  const [ipFilter, setIpFilter] = useState("");
  const { Panel } = Collapse;
  const { Title } = Typography;

  const handleDocumentIdChange = (e) => {
    setDocumentId(e.target.value);
  };

  const handleView = async () => {
    if (!documentId) {
      notification.error({
        message: "No Document ID",
        description: "Please provide a Document ID first.",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/packets/range?id=${documentId}&start=0&end=100`
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
    if (!documentId) {
      notification.error({
        message: "No Document ID",
        description: "Please provide a Document ID first.",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/packets/urls-by-source-ip?id=${documentId}&src=${ipFilter}`
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

  const handleUrlClick = async (objectNumber) => {
    console.log(objectNumber);
    try {
      const record = await axios.get(
        `http://localhost:5000/api/packets/object?id=${documentId}&index=${objectNumber}`
      );
      Modal.info({
        title: "Detailed Information",
        content: (
          <div style={{ width: 1000, maxHeight: "600px", overflowY: "auto" }}>
            <Collapse defaultActiveKey={["1"]} bordered={false}>
              <Collapse.Panel header="General Information" key="1">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Time">
                    {record.data.data.time}
                  </Descriptions.Item>
                  <Descriptions.Item label="Arrival Time">
                    {record.data.data.arrival_time}
                  </Descriptions.Item>
                  <Descriptions.Item label="UTC Arrival Time">
                    {record.data.data.UTC_arrival_time}
                  </Descriptions.Item>
                  <Descriptions.Item label="Frame Number">
                    {record.data.data.frame_number || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Protocol in Frame">
                    {record.data.data.protocol_in_frame}
                  </Descriptions.Item>
                  <Descriptions.Item label="Coloring Rule Name">
                    {record.data.data.coloring_rule_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Coloring Rule Strength">
                    {record.data.data.coloring_rule_strength || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Source">
                    {record.data.data.source}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destination">
                    {record.data.data.destination}
                  </Descriptions.Item>
                  <Descriptions.Item label="Source Port">
                    {record.data.data.source_port}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destination Port">
                    {record.data.data.destination_port}
                  </Descriptions.Item>
                  <Descriptions.Item label="Length">
                    {record.data.data.length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Info">
                    {record.data.data.info}
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
              <Collapse.Panel header="Ethernet Details" key="2">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Destination">
                    {record.data.data.ethernet.dst}
                  </Descriptions.Item>
                  <Descriptions.Item label="Source">
                    {record.data.data.ethernet.src}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    {record.data.data.ethernet.type}
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
              <Collapse.Panel header="Additional Details" key="3">
                <Collapse>
                  {Object.entries(record.data.data.details).map(
                    ([protocol, details]) => (
                      <Collapse.Panel header={protocol} key={protocol}>
                        <Descriptions column={2} bordered>
                          {Object.entries(details).map(([key, value]) => (
                            <Descriptions.Item label={key} key={key}>
                              {value !== null ? value.toString() : "N/A"}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      </Collapse.Panel>
                    )
                  )}
                </Collapse>
              </Collapse.Panel>
            </Collapse>
          </div>
        ),
        width: 1100,
        bodyStyle: { padding: "20px" }, // Add padding inside the modal
      });
    } catch (error) {
      notification.error({
        message: "Error fetching packet details",
        description: error.message,
      });
    }
  };

  const handleIpFilterChange = (e) => {
    setIpFilter(e.target.value);
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
      <Input
        placeholder="Enter Document ID"
        value={documentId}
        onChange={handleDocumentIdChange}
        style={{ width: "20%", marginBottom: "10px" }}
      />
      <Button onClick={handleView} icon={<DatabaseOutlined />}>
        View Data
      </Button>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Search by Info"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "40%" }}
        />
        <Button onClick={handleSearch} icon={<SearchOutlined />}>
          Search
        </Button>

        <Input
          placeholder="Filter by IP Source"
          value={ipFilter}
          onChange={handleIpFilterChange}
          style={{ width: "40%" }}
        />
        <Button onClick={handleUrlSearch} icon={<SearchOutlined />}>
          Search URLs
        </Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record.frame_number}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: "20px" }}
      />

      <Modal
        visible={urlModalVisible}
        onCancel={() => setUrlModalVisible(false)}
        footer={null}
        title="Source IP History"
        width={800}
        bodyStyle={{ padding: "20px" }}
      >
        <Table
          dataSource={urls}
          columns={[
            {
              title: "Object Number",
              dataIndex: "objectId",
              key: "objectId",
            },
            { title: "URL", dataIndex: "url", key: "url" },
            {
              title: "Arival Time",
              dataIndex: "arrivalTime",
              key: "arrivalTime",
            },
            {
              title: "Actions",
              key: "actions",
              render: (text, record) => (
                <Button onClick={() => handleUrlClick(record.objectId)}>
                  View Details
                </Button>
              ),
            },
          ]}
          rowKey="object_number"
        />
      </Modal>
    </div>
  );
};

export default PcapViewer;

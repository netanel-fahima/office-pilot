import React, { useState, useCallback } from "react";
import {
  Table,
  Button,
  Switch,
  Modal,
  Form,
  Select,
  Input,
  Space,
  message,
} from "antd";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import type { ColumnConfig } from "@root/types/table";
import { Settings2, Plus, Edit, Trash2 } from "lucide-react";
import { db } from "@src/config/firebaseConfig";

const tables = ["contacts", "customers", "employers"];

export default function ColumnManager() {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [selectedTable, setSelectedTable] = useState("contacts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [showDropdownOptions, setShowDropdownOptions] = useState(false);
  const [dropdownValues, setDropdownValues] = useState<
    { label: string; value: string }[]
  >([]);

  const filteredColumns = columns.filter(
    (col) => col.tableName === selectedTable
  );
  const editingColumn = editingColumnId
    ? columns.find((col) => col.id === editingColumnId) || null
    : null;

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "columns"),
        where("tableName", "==", selectedTable)
      );
      const querySnapshot = await getDocs(q);
      const columnsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as ColumnConfig[];
      setColumns(columnsData);
    } catch (error) {
      console.error("Error fetching columns:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  React.useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const handleToggle = async (id: string, field: keyof ColumnConfig) => {
    try {
      const docRef = doc(db, "columns", id);
      const updatedValue = !columns.find((col) => col.id === id)?.[field];
      await updateDoc(docRef, { [field]: updatedValue });
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === id ? { ...col, [field]: updatedValue } : col
        )
      );
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "columns", id));
      setColumns((prevColumns) => prevColumns.filter((col) => col.id !== id));
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const handleComponentTypeChange = (value: string) => {
    const isDropdown = value === "dropdown";
    setShowDropdownOptions(isDropdown);
    form.setFieldsValue({
      dropdownOptionsType: isDropdown ? "static" : undefined,
      dropdownValues: isDropdown ? [] : undefined,
      sourceTable: undefined,
      labelField: undefined,
      valueField: undefined,
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Validate required fields
      if (
        !values.tableName ||
        !values.label ||
        !values.title ||
        !values.gridField
      ) {
        throw new Error("נא למלא את כל השדות החובה");
      }

      // Clean and validate dropdown values if they exist
      const cleanDropdownValues =
        values.dropdownValues?.filter(
          (item) =>
            item &&
            typeof item.label === "string" &&
            typeof item.value === "string" &&
            item.label.trim() &&
            item.value.trim()
        ) || [];

      // Create a clean object with proper types to prevent circular references
      const columnData = {
        tableName: String(values.tableName),
        align: String(values.align || "right"),
        fixed: values.fixed || null,
        label: String(values.label),
        exportLabel: String(values.exportLabel || values.label),
        readOnly: values.readOnly || false,
        componentType: {
          name: String(values.componentType || "text"),
          order: parseInt(values.order) || 1,
        } as const,
        title: String(values.title),
        gridField: String(values.gridField),
        width: values.width ? Number(values.width) : null,
        minWidth: values.minWidth ? Number(values.minWidth) : null,
        ellipsis: values.ellipsis || false,
        defaultSortOrder: values.defaultSortOrder || null,
        sortDirections: ["ascend", "descend"],
        gridVisible: values.gridVisible || false,
        gridInitialHide: values.gridInitialHide || false,
        gridSortable: values.gridSortable || false,
        gridFilterable: values.gridFilterable || false,
        gridExportable: values.gridExportable || false,
        gridEditable: values.gridEditable || false,
        gridAutosize: values.gridAutosize || false,
        hidden: values.hidden || false,
        dropdownOptions:
          values.componentType === "dropdown"
            ? {
                type: String(values.dropdownOptionsType || "static"),
                values:
                  values.dropdownOptionsType === "static"
                    ? cleanDropdownValues
                    : null,
                sourceTable:
                  values.dropdownOptionsType === "dynamic"
                    ? String(values.sourceTable || "")
                    : null,
                labelField:
                  values.dropdownOptionsType === "dynamic"
                    ? String(values.labelField || "")
                    : null,
                valueField:
                  values.dropdownOptionsType === "dynamic"
                    ? String(values.valueField || "")
                    : null,
              }
            : null,
      };

      // Validate required fields for dynamic dropdowns
      if (
        values.componentType === "dropdown" &&
        values.dropdownOptionsType === "dynamic"
      ) {
        if (
          !columnData.dropdownOptions?.sourceTable ||
          !columnData.dropdownOptions?.labelField ||
          !columnData.dropdownOptions?.valueField
        ) {
          throw new Error(
            "נא למלא את כל השדות הנדרשים עבור רשימה נפתחת דינמית"
          );
        }
      }

      // Validate static dropdown values
      if (
        values.componentType === "dropdown" &&
        values.dropdownOptionsType === "static" &&
        (!cleanDropdownValues || cleanDropdownValues.length === 0)
      ) {
        throw new Error("נא להזין לפחות ערך אחד לרשימה הנפתחת");
      }

      // Validate required fields for dynamic dropdowns
      if (
        values.componentType === "dropdown" &&
        values.dropdownOptionsType === "dynamic"
      ) {
        if (
          !columnData.dropdownOptions?.sourceTable ||
          !columnData.dropdownOptions?.labelField ||
          !columnData.dropdownOptions?.valueField
        ) {
          throw new Error(
            "נא למלא את כל השדות הנדרשים עבור רשימה נפתחת דינמית"
          );
        }
      }

      if (editingColumnId) {
        const docRef = doc(db, "columns", editingColumnId);
        await updateDoc(docRef, columnData);
        setColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.id === editingColumnId
              ? { ...columnData, id: editingColumnId }
              : col
          )
        );
      } else {
        const docRef = await addDoc(collection(db, "columns"), columnData);
        setColumns((prevColumns) => [
          ...prevColumns,
          { ...columnData, id: docRef.id },
        ]);
      }

      setIsModalOpen(false);
      setEditingColumnId(null);
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || "שגיאה בשמירת הנתונים");
      } else {
        message.error("שגיאה בשמירת הנתונים");
      }
    }
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      tableName: selectedTable,
      align: "right",
      gridVisible: true,
      gridExportable: true,
      gridAutosize: true,
    });
  };

  const openEditModal = (record: ColumnConfig) => {
    setEditingColumnId(record.id);

    // Create a clean form object to avoid circular references
    form.setFieldsValue({
      tableName: record.tableName,
      align: record.align || "right",
      fixed: record.fixed || undefined,
      label: record.label,
      exportLabel: record.exportLabel,
      readOnly: record.readOnly,
      title: record.title,
      componentType: record.componentType?.name || "text",
      order: record.componentType?.order || 1,
      gridField: record.gridField,
      width: record.width || "",
      minWidth: record.minWidth || "",
      ellipsis: record.ellipsis,
      defaultSortOrder: record.defaultSortOrder || "",
      gridVisible: record.gridVisible,
      gridInitialHide: record.gridInitialHide,
      gridSortable: record.gridSortable,
      gridFilterable: record.gridFilterable,
      gridExportable: record.gridExportable,
      gridEditable: record.gridEditable,
      gridAutosize: record.gridAutosize,
      hidden: record.hidden,
      dropdownOptionsType: record.dropdownOptions?.type,
      dropdownValues: record.dropdownOptions?.values,
      sourceTable: record.dropdownOptions?.sourceTable,
      labelField: record.dropdownOptions?.labelField,
      valueField: record.dropdownOptions?.valueField,
    });

    setIsModalOpen(true);
    setShowDropdownOptions(record.componentType?.name === "dropdown");
  };

  const tableColumns = [
    {
      title: "תווית",
      dataIndex: "label",
      key: "label",
      width: 150,
    },
    {
      title: "שדה",
      dataIndex: "gridField",
      key: "gridField",
      width: 150,
    },
    {
      title: "מוסתר?",
      key: "gridInitialHide",
      width: 80,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridInitialHide}
          onChange={() => handleToggle(record.id, "gridInitialHide")}
        />
      ),
    },
    {
      title: "מיון?",
      key: "gridSortable",
      width: 80,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridSortable}
          onChange={() => handleToggle(record.id, "gridSortable")}
        />
      ),
    },
    {
      title: "סינון?",
      key: "gridFilterable",
      width: 80,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridFilterable}
          onChange={() => handleToggle(record.id, "gridFilterable")}
        />
      ),
    },
    {
      title: "ייצוא?",
      key: "gridExportable",
      width: 80,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridExportable}
          onChange={() => handleToggle(record.id, "gridExportable")}
        />
      ),
    },
    {
      title: "עריכה?",
      key: "gridEditable",
      width: 80,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridEditable}
          onChange={() => handleToggle(record.id, "gridEditable")}
        />
      ),
    },
    {
      title: "גודל אוטומטי?",
      key: "gridAutosize",
      width: 100,
      render: (_: any, record: ColumnConfig) => (
        <Switch
          checked={record.gridAutosize}
          onChange={() => handleToggle(record.id, "gridAutosize")}
        />
      ),
    },
    {
      title: "פעולות",
      key: "actions",
      width: 100,
      render: (_: any, record: ColumnConfig) => (
        <Space>
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold">ניהול עמודות</h1>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={selectedTable}
                onChange={setSelectedTable}
                style={{ width: 200 }}
                options={tables.map((table) => ({
                  value: table,
                  label: table,
                }))}
              />

              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingColumnId(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                הוסף עמודה
              </Button>
            </div>
          </div>

          <Table
            columns={tableColumns}
            dataSource={filteredColumns}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
        </div>

        <Modal
          title={editingColumnId ? "עריכת עמודה" : "הוספת עמודה"}
          open={isModalOpen}
          onOk={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingColumnId(null);
            form.resetFields();
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              tableName: selectedTable,
              align: "right",
              gridVisible: true,
              gridExportable: true,
              gridAutosize: true,
            }}
          >
            <Form.Item
              name="tableName"
              label="שם הטבלה"
              rules={[{ required: true, message: "נא לבחור טבלה" }]}
            >
              <Select
                options={tables.map((table) => ({
                  value: table,
                  label: table,
                }))}
                disabled={!!editingColumnId}
              />
            </Form.Item>

            <Form.Item
              name="align"
              label="יישור"
              rules={[{ required: true, message: "נא לבחור יישור" }]}
            >
              <Select>
                <Select.Option value="right">ימין</Select.Option>
                <Select.Option value="left">שמאל</Select.Option>
                <Select.Option value="center">מרכז</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="fixed" label="קיבוע עמודה">
              <Select>
                <Select.Option value="">ללא קיבוע</Select.Option>
                <Select.Option value="left">קיבוע לשמאל</Select.Option>
                <Select.Option value="right">קיבוע לימין</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="label"
              label="תווית"
              rules={[{ required: true, message: "נא להזין תווית" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="exportLabel"
              label="תווית ייצוא"
              rules={[{ required: true, message: "נא להזין תווית ייצוא" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="title"
              label="כותרת"
              rules={[{ required: true, message: "נא להזין כותרת" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="componentType"
              label="סוג רכיב"
              rules={[{ required: true, message: "נא לבחור סוג רכיב" }]}
            >
              <Select onChange={handleComponentTypeChange}>
                <Select.Option value="text">טקסט</Select.Option>
                <Select.Option value="number">מספר</Select.Option>
                <Select.Option value="dropdown">רשימה נפתחת</Select.Option>
                <Select.Option value="checkbox">תיבת סימון</Select.Option>
                <Select.Option value="date">תאריך</Select.Option>
                <Select.Option value="time">שעה</Select.Option>
                <Select.Option value="datetime">תאריך ושעה</Select.Option>
                <Select.Option value="textarea">
                  שדה טקסט מרובה שורות
                </Select.Option>
                <Select.Option value="email">דואר אלקטרוני</Select.Option>
                <Select.Option value="tel">טלפון</Select.Option>
                <Select.Option value="url">כתובת אינטרנט</Select.Option>
                <Select.Option value="password">סיסמה</Select.Option>
                <Select.Option value="radio">כפתורי רדיו</Select.Option>
                <Select.Option value="file">קובץ</Select.Option>
                <Select.Option value="image">תמונה</Select.Option>
              </Select>
            </Form.Item>

            {showDropdownOptions && (
              <>
                <Form.Item
                  name="dropdownOptionsType"
                  label="מקור נתונים"
                  rules={[{ required: true, message: "נא לבחור מקור נתונים" }]}
                >
                  <Select>
                    <Select.Option value="static">
                      הזנת ערכים קבועים
                    </Select.Option>
                    <Select.Option value="dynamic">
                      בחירה מטבלה אחרת
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues?.dropdownOptionsType !==
                    currentValues?.dropdownOptionsType
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("dropdownOptionsType") === "static" ? (
                      <Form.List name="dropdownValues">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <Space key={field.name} align="baseline">
                                <Form.Item
                                  key={`${field.key}-label`}
                                  name={[field.name, "label"]}
                                  label={index === 0 ? "ערכים" : ""}
                                  rules={[
                                    {
                                      required: true,
                                      message: "נא להזין תווית",
                                    },
                                  ]}
                                >
                                  <Input placeholder="תווית" />
                                </Form.Item>
                                <Form.Item
                                  key={`${field.key}-value`}
                                  name={[field.name, "value"]}
                                  rules={[
                                    { required: true, message: "נא להזין ערך" },
                                  ]}
                                >
                                  <Input placeholder="ערך" />
                                </Form.Item>
                                <Button
                                  type="text"
                                  danger
                                  onClick={() => remove(field.name)}
                                >
                                  מחק
                                </Button>
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block>
                                הוסף ערך
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    ) : getFieldValue("dropdownOptionsType") === "dynamic" ? (
                      <>
                        <Form.Item
                          name="sourceTable"
                          label="טבלת מקור"
                          rules={[
                            {
                              required: true,
                              message: "נא לבחור את הטבלה ממנה יילקחו הערכים",
                            },
                          ]}
                        >
                          <Select>
                            {tables.map((table) => (
                              <Select.Option key={table} value={table}>
                                {table}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name="labelField"
                          label="שדה תווית"
                          rules={[
                            {
                              required: true,
                              message: "נא להזין את שם השדה שיוצג ברשימה",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name="valueField"
                          label="שדה ערך"
                          rules={[
                            {
                              required: true,
                              message: "נא להזין את שם השדה שישמש כערך",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </>
                    ) : null
                  }
                </Form.Item>
              </>
            )}

            <Form.Item
              name="order"
              label="סדר"
              rules={[{ required: true, message: "נא להזין סדר" }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="gridField"
              label="שם השדה"
              rules={[{ required: true, message: "נא להזין שם שדה" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="width" label="רוחב (פיקסלים)">
              <Input type="number" />
            </Form.Item>

            <Form.Item name="minWidth" label="רוחב מינימלי (פיקסלים)">
              <Input type="number" />
            </Form.Item>

            <Form.Item name="defaultSortOrder" label="סדר מיון ברירת מחדל">
              <Select>
                <Select.Option value="">ללא</Select.Option>
                <Select.Option value="ascend">עולה</Select.Option>
                <Select.Option value="descend">יורד</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="קיצור טקסט ארוך (...)">
              <Form.Item name="ellipsis" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם גלוי?">
              <Form.Item name="gridVisible" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם להתחיל מוסתר?">
              <Form.Item name="gridInitialHide" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם ניתן למיין?">
              <Form.Item name="gridSortable" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם ניתן לסנן?">
              <Form.Item name="gridFilterable" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם ניתן לייצא?">
              <Form.Item name="gridExportable" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם ניתן לערוך?">
              <Form.Item name="gridEditable" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="האם להתאים גודל אוטומטית?">
              <Form.Item name="gridAutosize" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="קריאה בלבד?">
              <Form.Item name="readOnly" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>

            <Form.Item label="מוסתר לחלוטין?">
              <Form.Item name="hidden" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

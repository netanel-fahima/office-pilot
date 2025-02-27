import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Form,
  message,
  Select,
  Card,
  Modal,
  Checkbox,
} from "antd";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@src/config/firebaseConfig";
import { Plus, Search, Save, Edit, Trash2, Settings2 } from "lucide-react";
import type { ColumnConfig } from "@src/types/table";

interface DynamicTableProps {
  tableName: string;
  title: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: string;
  record: any;
  index: number;
  children: React.ReactNode;
  columns: ColumnConfig[];
  dropdownOptions: Record<string, { label: string; value: any }[]>;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  columns,
  dropdownOptions,
  ...restProps
}) => {
  const inputNode = (() => {
    switch (inputType) {
      case "number":
        return <Input type="number" />;
      case "dropdown":
        const column = columns.find((col) => col.gridField === dataIndex);
        const options =
          column?.dropdownOptions?.type === "static"
            ? column.dropdownOptions.values
            : dropdownOptions[dataIndex] || [];
        return <Select options={options} />;
      case "checkbox":
        return (
          <Select
            options={[
              { value: true, label: "כן" },
              { value: false, label: "לא" },
            ]}
          />
        );
      case "date":
        return <Input type="date" />;
      case "time":
        return <Input type="time" />;
      case "datetime":
        return <Input type="datetime-local" />;
      case "textarea":
        return <Input.TextArea />;
      case "email":
        return <Input type="email" />;
      case "tel":
        return <Input type="tel" />;
      case "url":
        return <Input type="url" />;
      case "password":
        return <Input.Password />;
      default:
        return <Input />;
    }
  })();

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `נא להזין ${title}`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const DynamicTable: React.FC<DynamicTableProps> = ({
  tableName,
  title,
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<Record<string, string[]>>(
    {}
  );
  const [searchText, setSearchText] = useState("");
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<
    Record<string, { label: string; value: any }[]>
  >({});

  const isEditing = (record: any) => record.id === editingKey;

  const fetchColumns = useCallback(async () => {
    let unsubscribe: (() => void) | undefined;
    try {
      const q = query(
        collection(db, "columns"),
        where("tableName", "==", tableName)
      );

      // Set up real-time listener
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const columnsData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as ColumnConfig[];
          setColumns(
            columnsData.sort(
              (a, b) =>
                (a.componentType?.order || 0) - (b.componentType?.order || 0)
            )
          );
          // Initialize visible columns with all non-hidden columns
          setVisibleColumns(
            columnsData.filter((col) => !col.hidden).map((col) => col.gridField)
          );
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching columns:", error);
          message.error("שגיאה בטעינת הגדרות העמודות");
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching columns:", error);
      message.error("שגיאה בטעינת הגדרות העמודות");
      setLoading(false);
      return () => unsubscribe?.();
    }
  }, [tableName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, tableName));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setData(fetchedData);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      message.error("שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    let cleanup: (() => void) | undefined;

    const setupSubscription = async () => {
      cleanup = await fetchColumns();
    };

    setupSubscription();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchColumns]);

  useEffect(() => {
    if (columns.length > 0) {
      fetchData();
    }
  }, [columns]);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      const dynamicDropdowns = columns.filter(
        (col) =>
          col.componentType?.name === "dropdown" &&
          col.dropdownOptions?.type === "dynamic"
      );

      for (const col of dynamicDropdowns) {
        if (
          !col.dropdownOptions?.sourceTable ||
          !col.dropdownOptions?.labelField ||
          !col.dropdownOptions?.valueField
        )
          continue;

        const q = collection(db, col.dropdownOptions.sourceTable);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const options = snapshot.docs.map((doc) => ({
            label: doc.data()[col.dropdownOptions!.labelField!],
            value: doc.data()[col.dropdownOptions!.valueField!],
          }));
          setDropdownOptions((prev) => ({
            ...prev,
            [col.gridField]: options,
          }));
        });

        // Cleanup subscription on unmount or when columns change
        return () => unsubscribe();
      }
    };

    fetchDropdownOptions();
  }, [columns]);

  const edit = (record: any) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          lastModifiedDate: new Date().toISOString(),
        };
        await updateDoc(doc(db, tableName, key), updatedItem);
        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey("");
        message.success("הרשומה עודכנה בהצלחה");
      }
    } catch (errInfo) {
      console.error("Validate Failed:", errInfo);
      message.error("שגיאה בעדכון הרשומה");
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteDoc(doc(db, tableName, key));
      setData(data.filter((item) => item.id !== key));
      message.success("הרשומה נמחקה בהצלחה");
    } catch (error) {
      console.error("Error deleting record:", error);
      message.error("שגיאה במחיקת הרשומה");
    }
  };

  const handleAdd = async () => {
    const newRecord = columns.reduce((acc, col) => {
      if (!col.gridField) return acc;
      acc[col.gridField] = "";
      return acc;
    }, {} as Record<string, any>);

    newRecord.createdDate = new Date().toISOString();
    newRecord.lastModifiedDate = new Date().toISOString();
    newRecord.version = 0;

    try {
      const docRef = doc(collection(db, tableName));
      await setDoc(docRef, newRecord);
      const newData = [...data, { ...newRecord, id: docRef.id }];
      setData(newData);
      edit(newData[newData.length - 1]);
      message.success("רשומה חדשה נוצרה בהצלחה");
    } catch (error) {
      console.error("Error adding record:", error);
      message.error("שגיאה ביצירת רשומה חדשה");
    }
  };

  const getColumnFilters = (field: string) => {
    const uniqueValues = new Set<string>();
    data.forEach((record) => {
      if (record[field] !== undefined && record[field] !== null) {
        uniqueValues.add(String(record[field]));
      }
    });
    return Array.from(uniqueValues).map((value) => ({
      text: value,
      value: value,
    }));
  };

  const handleTableChange = (pagination: any, filters: any) => {
    setFilteredInfo(filters);
  };

  const tableColumns = [
    ...columns
      .filter((col) => visibleColumns.includes(col.gridField))
      .map((col) => ({
        title: col.title,
        dataIndex: col.gridField,
        key: col.gridField,
        width: col.width,
        ellipsis: col.ellipsis,
        editable: col.gridEditable,
        align: col.align,
        fixed: col.fixed,
        ...(col.gridFilterable && {
          filterMode: "menu",
          filters: getColumnFilters(col.gridField),
          filteredValue: filteredInfo[col.gridField] || null,
          onFilter: (value: string | number | boolean, record: any) =>
            record[col.gridField]
              ?.toString()
              .toLowerCase()
              .includes(value.toString().toLowerCase()),
        }),
        sorter: col.gridSortable
          ? (a: any, b: any) => {
              const aVal = a[col.gridField];
              const bVal = b[col.gridField];
              if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal);
              }
              return aVal - bVal;
            }
          : undefined,
        defaultSortOrder: col.defaultSortOrder,
      })),
    {
      title: "פעולות",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={() => save(record.id)}
            >
              שמור
            </Button>
            <Button onClick={cancel}>ביטול</Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="text"
              icon={<Edit className="w-4 h-4" />}
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            />
            <Popconfirm
              title="האם אתה בטוח שברצונך למחוק?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="text"
                danger
                icon={<Trash2 className="w-4 h-4" />}
                disabled={editingKey !== ""}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = tableColumns.map((col) => {
    if (!col.editable || col.key === "actions") {
      return col;
    }
    const column = columns.find((c) => c.gridField === col.dataIndex);
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: column?.componentType?.name || "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        columns,
        dropdownOptions,
      }),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">{title}</h1>
            <Space>
              <Button
                icon={<Settings2 className="w-4 h-4" />}
                onClick={() => setIsColumnSelectorOpen(true)}
              >
                הגדרת עמודות
              </Button>
              <Input
                placeholder="חיפוש..."
                prefix={<Search className="w-4 h-4" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAdd}
                disabled={editingKey !== ""}
              >
                הוסף רשומה
              </Button>
            </Space>
          </div>

          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: (props: any) => (
                    <EditableCell
                      {...props}
                      columns={columns}
                      dropdownOptions={dropdownOptions}
                    />
                  ),
                },
              }}
              bordered
              dataSource={data}
              columns={mergedColumns}
              rowKey="id"
              rowClassName={(record) =>
                isEditing(record) ? "editing-row" : ""
              }
              loading={loading}
              scroll={{ x: "max-content" }}
              onChange={handleTableChange}
              pagination={{
                onChange: cancel,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} מתוך ${total} רשומות`,
              }}
            />
          </Form>

          <Modal
            title="בחירת עמודות"
            open={isColumnSelectorOpen}
            onOk={() => setIsColumnSelectorOpen(false)}
            onCancel={() => setIsColumnSelectorOpen(false)}
            width={400}
          >
            <div className="space-y-4">
              {columns
                .filter((col) => !col.hidden)
                .sort(
                  (a, b) =>
                    (a.componentType?.order || 0) -
                    (b.componentType?.order || 0)
                )
                .map((column) => (
                  <div
                    key={column.gridField}
                    className="flex items-center justify-between"
                  >
                    <span>{column.title}</span>
                    <Checkbox
                      checked={visibleColumns.includes(column.gridField)}
                      onChange={(checked) => {
                        setVisibleColumns((prev) =>
                          checked.target.checked
                            ? [...prev, column.gridField]
                            : prev.filter((field) => field !== column.gridField)
                        );
                      }}
                    />
                  </div>
                ))}
            </div>
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default DynamicTable;

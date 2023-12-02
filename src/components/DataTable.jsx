/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
    GridToolbar,
    gridPageCountSelector,
    GridPagination,
    useGridApiContext,
    useGridSelector,
} from "@mui/x-data-grid";
import MuiPagination from "@mui/material/Pagination";

const DataTable = () => {
    const [Rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectionModel, setSelectionModel] = useState([]);

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    };

    const handleDeletion = (id) => () => {
        setRows(Rows.filter((row) => row.id !== id));
    };

    const handleCancel = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = Rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(Rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(Rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const deleteSelectedRows = () => {
        let hasConfirmed = confirm("Do you want to delete the selected data?");
        if (hasConfirmed) {
            const filteredRows = Rows.filter(
                (row) => !selectionModel.includes(row.id)
            );
            setRows(filteredRows);
        }
    };

    function Pagination({ page, onPageChange, className }) {
        const apiRef = useGridApiContext();
        const pageCount = useGridSelector(apiRef, gridPageCountSelector);

        return (
            <MuiPagination
                color="primary"
                className={className}
                count={pageCount}
                page={page + 1}
                onChange={(event, newPage) => {
                    onPageChange(event, newPage - 1);
                }}
            />
        );
    }

    function CustomPagination(props) {
        return <GridPagination ActionsComponent={Pagination} {...props} />;
    }

    // Table Columns
    const columns = [
        {
            field: "name",
            headerName: "Name",
            type: "string",
            flex: 0.5,
            weight: 100,
            align: "center",
            headerAlign: "center",
            editable: true,
        },
        {
            field: "email",
            headerName: "Email",
            type: "string",
            flex: 1,
            align: "center",
            headerAlign: "center",
            editable: true,
        },
        {
            field: "role",
            headerName: "Role",
            type: "string",
            flex: 0.5,
            align: "center",
            headerAlign: "center",
            editable: true,
            sortable: false,
        },
        {
            field: "actions",
            headerName: "Actions",
            type: "actions",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id }) => {
                const isInEditMode =
                    rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            key="1"
                            label="Save"
                            sx={{
                                color: "primary.main",
                            }}
                            className="saveBtn"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            key="2"
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancel(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        key="3"
                        label="Edit"
                        className="editBtn"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        key="4"
                        onClick={handleDeletion(id)}
                        color="error"
                        className="dltBtn"
                    />,
                ];
            },
        },
    ];

    // Fetching data from API
    const fetchData = async () => {
        try {
            const response = await fetch(
                "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
            );
            if (response.status === 200) {
                const res = await response.json();
                console.log(res);
                setRows(res);
            }
        } catch (error) {
            console.log("Error in getting data from API");
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
const handleSelectTenRows = () => {
    // Get the first 10 rows on the current page
    const rowsOnCurrentPage = Rows.slice(0, 10);

    // Extract the IDs of the selected rows
    const selectedRowIds = rowsOnCurrentPage.map((row) => row.id);

    // Set the selection model to the IDs of the first 10 rows
    setSelectionModel(selectedRowIds);
};

const CustomHeaderCheckbox = () => (
    <input type="checkbox" onChange={handleSelectTenRows} />
);
    return (
        <div className="relative md:p-1">
            <Button
                variant="outlined"
                color="error"
                sx={{
                    marginTop: "4px",
                    position: "absolute",
                    left: "15px",
                    top: "10px",
                }}
                onClick={deleteSelectedRows}
            >
                Delete {selectionModel.length} rows
            </Button>
            <div className="w-full min-h-screen p-2">
                <DataGrid
                    rows={Rows}
                    columns={columns}
                    pagination
                    slots={{
                        pagination: CustomPagination,
                        toolbar: GridToolbar,
                    }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    disableColumnFilter
                    disableColumnSelector
                    disableDensitySelector
                    checkboxSelection
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    slotProps={{
                        toolbar: {
                            csvOptions: { disableToolbarButton: true },
                            printOptions: { disableToolbarButton: true },
                            setRows,
                            setRowModesModel,
                            showQuickFilter: true,
                        },
                    }}
                    onRowSelectionModelChange={setSelectionModel}
                    rowSelectionModel={selectionModel}
                    selectionModel={selectionModel}
                    onSelectionModelChange={(newSelectionModel) =>
                        setSelectionModel(newSelectionModel)
                    }
                    components={{
                        HeaderCheckbox: CustomHeaderCheckbox,
                        Toolbar: GridToolbar,
                    }}
                />
            </div>
        </div>
    );
};

export default DataTable;

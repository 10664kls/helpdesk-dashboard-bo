import { AccordionDetails, accordionDetailsClasses, AccordionSummary, Alert, Button,
   Fade, Grid2,  Paper, 
   Skeleton,
   Table, TableBody, TableCell, TableContainer, TableHead, 
   TablePagination, TableRow, Tooltip, Typography } from "@mui/material"
import { useState } from "react"
import Accordion, {
  AccordionSlots,
  accordionClasses,
} from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import api from "../utils/axios";
import Navbar from "../components/Navbar";

const Home = () =>{
  const [exportError, setExportError] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(100)
  const [expanded, setExpanded] = useState<boolean>(true);
  const [from, setFrom] = useState<DateTime | null>(null)
  const [to, setTo] = useState<DateTime | null>(null)
  const [pageToken, setPageToken] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [previousToken, setPreviousToken] = useState<string[]>([])

  const ticketsQuery = useQuery({
    queryKey: ["tickets", pageToken, pageSize, from, to],
    queryFn: async() => {
      const apiURL = new URL(`${import.meta.env.VITE_API_BASE_URL}/v1/helpdesk/tickets`)
      apiURL.searchParams.set("pageSize", pageSize.toString())
      if (from) {
        apiURL.searchParams.set("createdAfter", from.toString())
      }
      if (to) {
        const toDate = to.plus({ hours: 23, minutes: 59, seconds: 59 })
        apiURL.searchParams.set("createdBefore", toDate.toString())
      }
      if (pageToken) {
        apiURL.searchParams.set("pageToken", pageToken)
      }

      const resp = await api.get(apiURL.toString())
      if (resp.status !== 200) {
        throw new Error(resp.statusText)
      }
      return resp.data
    },
    refetchOnWindowFocus: false,
  })


  const indexOfLastItem = (pageNumber+1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value))
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  }

  const handleFromChange = (newValue: DateTime | null) => {
    setFrom(newValue)
  }

  const handleToChange = (newValue: DateTime | null) => {
    setTo(newValue)
  }

  const handPreviousToken = (token: string) => {
    setPreviousToken((t) => [...t, token]);
  };

  const getPreviousToken = (): string => {
    const token = previousToken[previousToken.length - 1];
    setPreviousToken((t) => t.slice(0, t.length - 1));
    return token
  };

  const handleExportToExcel = async() => {
    setExportLoading(true)
    const apiURL = new URL(`${import.meta.env.VITE_API_BASE_URL}/v1/helpdesk/tickets/export-to-excel`)
      if (from) {
        apiURL.searchParams.set("createdAfter", from.toString())
      }
      if (to) {
        const toDate = to.plus({ hours: 23, minutes: 59, seconds: 59 })
        apiURL.searchParams.set("createdBefore", toDate.toString())
      }

      try {
        const resp = await api.get(apiURL.toString(), {responseType: "blob"})
        if (resp.status !== 200) {
          throw new Error(resp.statusText)
        }

        const blob = resp.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "help-desk-tickets-report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportError(false)
        setExportLoading(false)
        return
      } catch (error) {
        console.error(error)
        setExportError(true)
        setExportLoading(false)
        return
      }
  }

  const resetFilters =() => {
    setFrom(null)
    setTo(null)
    setPageToken("")
    setPreviousToken([])
    setExportError(false)
    setPageNumber(0)
  }

  return (
    <>
      <Navbar />
      <Paper sx={{ p: 2, width: '100%' }}>
        <Typography variant="h5" sx={{mt: 3, mb: 1}}>List of tickets</Typography>
        <Accordion
            expanded={expanded}
            onChange={handleExpandClick}
            slots={{ transition: Fade as AccordionSlots['transition'] }}
            slotProps={{ transition: { timeout: 400 } }}
            sx={[
              expanded
                ? {
                    [`& .${accordionClasses.region}`]: {
                      height: 'auto',
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: 'block',
                    },
                  }
                : {
                    [`& .${accordionClasses.region}`]: {
                      height: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: 'none',
                    },
                  },
            ]}
          >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{p: 1}}
          >
            <Typography variant="h6" component="span">Filters</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Grid2 
              container 
              spacing={2} 
              sx={{mb: 2}} 
              display='flex'
            >
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6}}>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <DatePicker 
                    format="dd/MM/yyyy"
                    value={from} 
                    onChange={(date) => handleFromChange(date)} 
                    label="From"
                    slotProps={{
                      textField:{
                        name: "from",
                        id: "from",
                        fullWidth: true,
                        size: "medium"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 6}}>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <DatePicker 
                    format="dd/MM/yyyy"
                    value={to} 
                    onChange={(date) => handleToChange(date)} 
                    label="To"
                    slotProps={{
                      textField:{
                        name: "to",
                        id: "to",
                        fullWidth: true,
                        size: "medium"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
            </Grid2>

            {exportError && 
            <Alert severity="error" sx={{ mb: 1, mt: 1}}>[Export to excel] Something went wrong. Please try again later or contact the admin</Alert>}

            <Grid2 
              container 
              spacing={2} 
              sx={{mb: 0}}
              alignContent="center"
              justifyContent="center"
            >
              <Grid2 alignItems="center">
                <Button
                  loading={exportLoading}
                  loadingPosition="start"
                  variant="outlined"
                  onClick={handleExportToExcel}
                >Export To Excel</Button>
              </Grid2>
              <Grid2 alignItems="center">
                <Button 
                  variant="contained"
                  onClick={resetFilters}
                >Reset</Button>
              </Grid2>
            </Grid2>
          </AccordionDetails>
        </Accordion>

        <TableContainer component={Paper} sx={{ mb: 1}}>
          <Table size="small" aria-label="help desk requests">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Helpdesk No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type Form</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Staff Request</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>IT Support Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Support Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Request Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Closed Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                ticketsQuery.isLoading && 
                <TableRow>
                  <TableCell colSpan={16}>
                    <Skeleton />
                    <Skeleton animation="wave" />
                    <Skeleton animation={false} />
                  </TableCell>
                </TableRow>
              }

              {
                !ticketsQuery.isLoading &&
                ticketsQuery.data && 
                !ticketsQuery.isError && 
                ticketsQuery 
                .data
                .tickets.map((s : Ticket, index: number)=> {
                  return <TableRow 
                    key={s.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{index+1 +indexOfFirstItem}</TableCell>
                    <TableCell>{s.number}</TableCell>
                    <TableCell>
                      <Tooltip title={s.category}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.category}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={s.title}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.title}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={s.description}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{s.employee.id}</TableCell>
                    <TableCell>
                      <Tooltip title={s.employee.displayName}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.employee.displayName}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={s.employee.position}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.employee.position}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={s.employee.department}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.employee.department}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{s.employee.branch}</TableCell>
                    <TableCell>
                      <Tooltip title={s.supporter.displayName}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.supporter.displayName}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={s.supporter.position}>
                        <Typography 
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: 'inherit'
                          }}  
                        >
                          {s.supporter.position}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{s.priority}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          fontSize: 'inherit'
                        }}  
                      >
                      {DateTime.fromISO(s.createdAt, {zone: 'UTC'}).toFormat('dd/MM/yyyy HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          fontSize: 'inherit'
                        }}  
                      >
                      { DateTime.fromISO(s.closedDate, {zone: 'UTC'}).toFormat('dd/MM/yyyy') !=='01/01/1900' && DateTime.fromISO(s.closedDate, {zone: 'UTC'}).toFormat('dd/MM/yyyy')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                })
              }
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPage={pageSize}
          page={pageNumber}
          count={ticketsQuery.data ? ticketsQuery.data.tickets.length : 0}
          onPageChange={() => {}}
          onRowsPerPageChange={handlePageSizeChange}
          labelRowsPerPage="Page Size"
          labelDisplayedRows={() => ``}
          rowsPerPageOptions={[100, 200]}
          slotProps={{
            actions:{
              previousButton: {
                disabled: previousToken.length >= 1 ? false : true,
                onClick: () => {
                  if (pageNumber > 0 && previousToken.length > 0) {
                    setPageNumber(pageNumber - 1)
                    if (previousToken.length == 1){
                      setPreviousToken([])
                      setPageToken("")
                      return
                    }

                    const token = getPreviousToken()
                    setPageToken(token)
                  }
                }
              },
              nextButton:{
                disabled: ticketsQuery.data && ticketsQuery.data.nextPageToken.length > 0 ? false : true,
                onClick: () => {
                  if (ticketsQuery.data && ticketsQuery.data.nextPageToken.length > 0){
                    const token =ticketsQuery.data.nextPageToken
                    setPageNumber(pageNumber + 1)
                    setPageToken(token)
                    handPreviousToken(token)
                  }
                }
              }
            }
          }}
        />
      </Paper>
    </>
  )
} 

export interface Ticket {
  id: string
  number: string
  category: string
  priority: string
  status: string
  title: string
  description: string
  employee: Employee
  supporter: Supporter
  createdAt: string
  closedDate: string
}

export interface Employee {
  id: string
  displayName: string
  position: string
  department: string
  branch: string
}

export interface Supporter {
  displayName: string
  position: string
}

export default Home
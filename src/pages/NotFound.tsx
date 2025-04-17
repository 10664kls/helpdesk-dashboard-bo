import { Box, Button, Container, Grid2, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import notFoundImg from '../assets/error_404.svg';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="md">
        <Grid2 container spacing={2}>
          <Grid2 size={6}>
            <Typography variant="h1">
              404
            </Typography>
            <Typography variant="h6">
              The page you’re looking for doesn’t exist.
            </Typography>
            <Button sx={{ mt: 2 }} component={Link} to="/" variant="contained">Back Home</Button>
          </Grid2>
          <Grid2 size={6}>
            <img
              src={notFoundImg}
              alt=""
              width={500} height={250}
            />
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};
export default NotFoundPage;
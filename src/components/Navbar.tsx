import { AppBar,  Container,Toolbar, Typography } from "@mui/material"
import iconKrungsri from '../assets/krungsri_logo.ico';


const Navbar = () => {
  return (
    <AppBar position="sticky" color="inherit">
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img src={iconKrungsri} width="50px" alt="logo" />
          </Typography>
          <Typography 
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              flexGrow: 1,
              letterSpacing: '.3rem',
              textDecoration: 'none',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
            }}
          >
            Helpdesk
          </Typography>
            
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar
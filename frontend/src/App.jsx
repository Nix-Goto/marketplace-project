import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import { 
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import styled from 'styled-components';

// Стилизованные компоненты
const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  max-width: 280px;
  margin: 0 auto;
  background-color: #ffffff;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled(CardMedia)`
  height: 240px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  padding: 1rem;
`;

const ProductTitle = styled(Typography)`
  background-color: rgba(0, 91, 255, 0.1);
  color: #005bff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: inline-block;
`;

const PriceTypography = styled(Typography)`
  font-weight: bold;
  color: #ff0000;
  font-size: 1.5rem;
  margin: 0.5rem 0;
`;

const CategoryChip = styled.div`
  background-color: #ffffff;
  color: #707f8d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const SearchField = styled(TextField)`
  .MuiOutlinedInput-root {
    background-color: white;
    border-radius: 4px;
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #005bff;
    }
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #005bff;
    }
  }
`;

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/api/products/search?query=${searchQuery}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', newProduct);
      fetchProducts();
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: '#e5f0ff', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: '#005bff' }}>
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '0.5rem 2rem',
          minHeight: '72px',
          gap: '2rem'
        }}>
          <Box sx={{ 
            width: '33%',
            display: 'flex',
            justifyContent: 'flex-start',
            paddingLeft: '1rem'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Circular Std',
                fontWeight: 'bold',
                fontSize: '1.8rem',
              }}
            >
              ТАЕР
            </Typography>
          </Box>

          <Box sx={{ 
            width: '34%',
            display: 'flex', 
            justifyContent: 'center'
          }}>
            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px' }}>
              <SearchField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Искать на ТАЕР"
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" sx={{ color: '#005bff' }}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Box>

          <Box sx={{ 
            width: '33%',
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            justifyContent: 'flex-start'
          }}>
            <IconButton color="inherit" sx={{ padding: '8px' }}>
              <Badge badgeContent={0} color="error">
                <FavoriteIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" sx={{ padding: '8px' }}>
              <Badge badgeContent={0} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" sx={{ padding: '8px' }}>
              <PersonIcon />
            </IconButton>
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{ 
                ml: 2,
                height: '40px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Добавить товар
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 4, backgroundColor: 'transparent' }}>
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <StyledCard>
                <ProductImage
                  image={product.image_url || 'https://via.placeholder.com/200'}
                  title={product.name}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
                  <ProductTitle>
                    {product.name}
                  </ProductTitle>
                  <CategoryChip>{product.category || 'Без категории'}</CategoryChip>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 'auto',
                      height: '2em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      marginTop: '8px'
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <PriceTypography variant="h6">
                      {Number(product.price).toLocaleString('ru-RU')} ₽
                    </PriceTypography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        bgcolor: '#005bff',
                        '&:hover': {
                          bgcolor: '#004ee6'
                        }
                      }}
                    >
                      В корзину
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Add Product Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Добавить новый товар</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddProduct} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название товара"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Описание"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Цена"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Категория"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="URL изображения"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleAddProduct} 
            variant="contained"
            sx={{ 
              bgcolor: '#005bff',
              '&:hover': {
                bgcolor: '#004ee6'
              }
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App; 
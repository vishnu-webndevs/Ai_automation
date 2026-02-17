import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Import Pages
import Home from './pages/Home';
import PricingPage from './pages/PricingPage';
import Customers from './pages/Customers';
import Changelog from './pages/Changelog';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import StyleGuide from './pages/StyleGuide';
import DynamicPage from './pages/DynamicPage';

// Import Templates
import ServiceList from './templates/ServiceList';
import ServiceDetail from './templates/ServiceDetail';
import IndustryList from './templates/IndustryList';
import IndustryDetail from './templates/IndustryDetail';
import UseCaseList from './templates/UseCaseList';
import UseCaseDetail from './templates/UseCaseDetail';
import BlogList from './templates/BlogList';
import BlogDetail from './templates/BlogDetail';
import BlogCategoryList from './templates/BlogCategoryList';
import BlogCategoryDetail from './templates/BlogCategoryDetail';
import SolutionList from './templates/SolutionList';
import SolutionDetail from './templates/SolutionDetail';
import ToolsList from './templates/ToolsList';
import ToolDetail from './templates/ToolDetail';
import IntegrationList from './templates/IntegrationList';
import IntegrationDetail from './templates/IntegrationDetail';
import PlatformList from './templates/PlatformList';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* Explicit Content Routes */}
          <Route path="services" element={<ServiceList />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          
          <Route path="industries" element={<IndustryList />} />
          <Route path="industries/:slug" element={<IndustryDetail />} />
          
          <Route path="use-cases" element={<UseCaseList />} />
          <Route path="use-cases/:slug" element={<UseCaseDetail />} />
          
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="blog/categories" element={<BlogCategoryList />} />
          <Route path="blog/category/:slug" element={<BlogCategoryDetail />} />
          
          <Route path="solutions" element={<SolutionList />} />
          <Route path="solutions/:slug" element={<SolutionDetail />} />
          <Route path="tools" element={<ToolsList />} />
          <Route path="tools/:slug" element={<ToolDetail />} />
          <Route path="integrations" element={<IntegrationList />} />
          <Route path="integrations/:slug" element={<IntegrationDetail />} />
          <Route path="platform" element={<PlatformList />} />

          {/* Static Pages */}
          <Route path="login" element={<SignIn />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="style-guide" element={<StyleGuide />} />
          <Route path="changelog" element={<Changelog />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pricing" element={<PricingPage />} />

          {/* Main Home Route - Static Home Page */}
          <Route index element={<Home />} />
          <Route path="home" element={<Navigate to="/" replace />} />

          {/* Main catch-all route for Dynamic Pages */}
          <Route path="*" element={<DynamicPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

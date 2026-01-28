
import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './layout';
import Page from './page';

/**
 * Entry point for the application.
 * Renders the Page inside the Layout to simulate the Next.js App Router hierarchy.
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Layout>
      <Page />
    </Layout>
  </React.StrictMode>
);

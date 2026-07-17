import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock heavy map/chart dependencies
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn() }),
}));

vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
}));

describe('App', () => {
  it('renders without crashing', () => {
    // App already contains its own BrowserRouter — render directly
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('mounts and renders a non-empty body', () => {
    render(<App />);
    expect(document.querySelector('body')).not.toBeNull();
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });
});

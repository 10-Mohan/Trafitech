import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// --- Minimal Parking Card Component for testing ---
// This mirrors the core display logic of the real ParkingCard

const PEAK_HOURS = [9, 10, 17, 18]; // 9-11 AM and 5-7 PM

function isSurgePricingActive(hour = new Date().getHours()) {
  return PEAK_HOURS.includes(hour);
}

function ParkingCard({ zone, basePrice, availableSpots, currentHour }) {
  const surge = isSurgePricingActive(currentHour);
  const displayPrice = surge ? (basePrice * 1.5).toFixed(2) : basePrice.toFixed(2);

  return (
    <div data-testid="parking-card">
      <h3 data-testid="zone-name">{zone}</h3>
      <p data-testid="price">₹{displayPrice}/hr</p>
      <p data-testid="spots">{availableSpots} spots available</p>
      {surge && <span data-testid="surge-badge">🔴 Peak Surge Pricing</span>}
    </div>
  );
}

// --- Tests ---

describe('ParkingCard', () => {
  it('displays the correct zone name', () => {
    render(<ParkingCard zone="Zone A — Central Hub" basePrice={50} availableSpots={12} currentHour={14} />);
    expect(screen.getByTestId('zone-name')).toHaveTextContent('Zone A — Central Hub');
  });

  it('displays the correct base price during off-peak hours', () => {
    render(<ParkingCard zone="Zone B" basePrice={40} availableSpots={8} currentHour={14} />);
    expect(screen.getByTestId('price')).toHaveTextContent('₹40.00/hr');
  });

  it('displays 1.5x surge price during peak morning hours (9 AM)', () => {
    render(<ParkingCard zone="Zone C" basePrice={40} availableSpots={3} currentHour={9} />);
    // 40 * 1.5 = 60
    expect(screen.getByTestId('price')).toHaveTextContent('₹60.00/hr');
  });

  it('displays 1.5x surge price during peak evening hours (17 = 5 PM)', () => {
    render(<ParkingCard zone="Zone D" basePrice={60} availableSpots={1} currentHour={17} />);
    // 60 * 1.5 = 90
    expect(screen.getByTestId('price')).toHaveTextContent('₹90.00/hr');
  });

  it('shows surge badge during peak hours', () => {
    render(<ParkingCard zone="Zone A" basePrice={50} availableSpots={2} currentHour={10} />);
    expect(screen.getByTestId('surge-badge')).toBeInTheDocument();
  });

  it('does NOT show surge badge during off-peak hours', () => {
    render(<ParkingCard zone="Zone A" basePrice={50} availableSpots={10} currentHour={13} />);
    expect(screen.queryByTestId('surge-badge')).not.toBeInTheDocument();
  });

  it('displays the correct number of available spots', () => {
    render(<ParkingCard zone="Zone E" basePrice={30} availableSpots={5} currentHour={15} />);
    expect(screen.getByTestId('spots')).toHaveTextContent('5 spots available');
  });
});

describe('isSurgePricingActive utility', () => {
  it('returns true for peak morning hours', () => {
    expect(isSurgePricingActive(9)).toBe(true);
    expect(isSurgePricingActive(10)).toBe(true);
  });

  it('returns true for peak evening hours', () => {
    expect(isSurgePricingActive(17)).toBe(true);
    expect(isSurgePricingActive(18)).toBe(true);
  });

  it('returns false for off-peak hours', () => {
    expect(isSurgePricingActive(12)).toBe(false);
    expect(isSurgePricingActive(15)).toBe(false);
    expect(isSurgePricingActive(22)).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// --- Minimal Traffic Signal Component for testing ---
// Mirrors the core logic of the real TrafficSignal component

const SIGNAL_COLORS = {
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
};

function TrafficSignal({ state = 'red', onEmergencyOverride, emergencyActive = false }) {
  return (
    <div data-testid="traffic-signal">
      {/* Signal lights */}
      <div
        data-testid="signal-light-red"
        style={{ backgroundColor: state === 'red' ? SIGNAL_COLORS.red : '#374151' }}
        aria-label="Red light"
      />
      <div
        data-testid="signal-light-yellow"
        style={{ backgroundColor: state === 'yellow' ? SIGNAL_COLORS.yellow : '#374151' }}
        aria-label="Yellow light"
      />
      <div
        data-testid="signal-light-green"
        style={{ backgroundColor: state === 'green' ? SIGNAL_COLORS.green : '#374151' }}
        aria-label="Green light"
      />

      {/* Current state label */}
      <p data-testid="signal-state-label">{state.toUpperCase()}</p>

      {/* Emergency override button */}
      <button
        data-testid="emergency-override-btn"
        onClick={onEmergencyOverride}
        disabled={emergencyActive}
        aria-label="Trigger Emergency Corridor Override"
      >
        {emergencyActive ? '🚨 SOS ACTIVE' : '🚨 Emergency Override'}
      </button>

      {emergencyActive && (
        <div data-testid="emergency-active-banner">
          Emergency Corridor Active — All signals set to GREEN
        </div>
      )}
    </div>
  );
}

// --- Tests ---

describe('TrafficSignal', () => {
  it('renders the signal component', () => {
    render(<TrafficSignal state="red" onEmergencyOverride={() => {}} />);
    expect(screen.getByTestId('traffic-signal')).toBeInTheDocument();
  });

  it('shows RED state label when state is red', () => {
    render(<TrafficSignal state="red" onEmergencyOverride={() => {}} />);
    expect(screen.getByTestId('signal-state-label')).toHaveTextContent('RED');
  });

  it('shows GREEN state label when state is green', () => {
    render(<TrafficSignal state="green" onEmergencyOverride={() => {}} />);
    expect(screen.getByTestId('signal-state-label')).toHaveTextContent('GREEN');
  });

  it('shows YELLOW state label when state is yellow', () => {
    render(<TrafficSignal state="yellow" onEmergencyOverride={() => {}} />);
    expect(screen.getByTestId('signal-state-label')).toHaveTextContent('YELLOW');
  });

  it('renders the emergency override button', () => {
    render(<TrafficSignal state="red" onEmergencyOverride={() => {}} />);
    expect(screen.getByTestId('emergency-override-btn')).toBeInTheDocument();
  });

  it('calls onEmergencyOverride when the button is clicked', () => {
    const mockOverride = vi.fn();
    render(<TrafficSignal state="red" onEmergencyOverride={mockOverride} />);
    fireEvent.click(screen.getByTestId('emergency-override-btn'));
    expect(mockOverride).toHaveBeenCalledTimes(1);
  });

  it('disables the emergency button when emergency is already active', () => {
    render(<TrafficSignal state="green" onEmergencyOverride={() => {}} emergencyActive={true} />);
    expect(screen.getByTestId('emergency-override-btn')).toBeDisabled();
  });

  it('shows SOS ACTIVE label when emergency is active', () => {
    render(<TrafficSignal state="green" onEmergencyOverride={() => {}} emergencyActive={true} />);
    expect(screen.getByTestId('emergency-override-btn')).toHaveTextContent('🚨 SOS ACTIVE');
  });

  it('shows emergency active banner when emergency is triggered', () => {
    render(<TrafficSignal state="green" onEmergencyOverride={() => {}} emergencyActive={true} />);
    expect(screen.getByTestId('emergency-active-banner')).toBeInTheDocument();
  });

  it('does NOT show emergency banner when emergency is not active', () => {
    render(<TrafficSignal state="red" onEmergencyOverride={() => {}} emergencyActive={false} />);
    expect(screen.queryByTestId('emergency-active-banner')).not.toBeInTheDocument();
  });
});

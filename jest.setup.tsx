import '@testing-library/jest-dom';

// Global Mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 0) as any;
};
global.cancelAnimationFrame = (id: any) => {
  clearTimeout(id);
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
};

// Mock AudioContext
class MockAudioContext {
  state = 'suspended';
  createMediaStreamSource() {
    return { connect: jest.fn() };
  }
  createAnalyser() {
    return {
      connect: jest.fn(),
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn((dataArray) => {
        // Fill with values that result in volume > 12
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = i % 2 === 0 ? 150 : 100;
        }
      }),
      fftSize: 2048,
      frequencyBinCount: 1024,
    };
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [
        { stop: jest.fn(), enabled: true },
        { stop: jest.fn(), enabled: true },
      ],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
  configurable: true,
});

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: 'test-id',
  })),
  usePathname: jest.fn(() => '/'),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock VideoSDK
jest.mock('@videosdk.live/rtc-js-prebuilt', () => ({
  VideoSDK: {
    init: jest.fn(),
    config: jest.fn(),
  },
}));

// Mock Daily.co
jest.mock('@daily-co/daily-js', () => ({
  createFrame: jest.fn().mockReturnValue({
    join: jest.fn().mockResolvedValue({}),
    leave: jest.fn().mockResolvedValue({}),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

// Mock RecordRTC
jest.mock('recordrtc', () => {
  return jest.fn().mockImplementation(() => ({
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    getBlob: jest.fn(),
    destroy: jest.fn(),
  }));
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const MotionComponent = (tag: string) => ({ children, whileHover, whileTap, animate, initial, exit, transition, ...props }: any) => 
    React.createElement(tag, props, children);

  return {
    motion: {
      div: MotionComponent('div'),
      main: MotionComponent('main'),
      button: MotionComponent('button'),
      span: MotionComponent('span'),
      nav: MotionComponent('nav'),
      section: MotionComponent('section'),
      article: MotionComponent('article'),
      p: MotionComponent('p'),
      h1: MotionComponent('h1'),
      h2: MotionComponent('h2'),
      h3: MotionComponent('h3'),
      animate: jest.fn(),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: any) => <>{children}</>,
}));

// Mock Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    promise: jest.fn(),
  },
}));

// Mock Radix UI components that often cause issues in JSDOM
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: any) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children }: any) => <div data-testid="dropdown-content" role="menu">{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="dropdown-item" role="menuitem" {...props}>{children}</div>,
  Group: ({ children }: any) => <div data-testid="dropdown-group" role="group">{children}</div>,
  Label: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  Separator: () => <div data-testid="dropdown-separator" role="separator" />,
  CheckboxItem: ({ children }: any) => <div data-testid="dropdown-checkbox" role="menuitemcheckbox">{children}</div>,
  RadioGroup: ({ children }: any) => <div data-testid="dropdown-radio-group" role="group">{children}</div>,
  RadioItem: ({ children }: any) => <div data-testid="dropdown-radio-item" role="menuitemradio">{children}</div>,
  ItemIndicator: ({ children }: any) => <div data-testid="dropdown-item-indicator">{children}</div>,
  Sub: ({ children }: any) => <div data-testid="dropdown-sub">{children}</div>,
  SubTrigger: ({ children }: any) => <div data-testid="dropdown-sub-trigger" role="menuitem" aria-haspopup="true">{children}</div>,
  SubContent: ({ children }: any) => <div data-testid="dropdown-sub-content" role="menu">{children}</div>,
}));

jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: any) => <div data-testid="dialog-root">{children}</div>,
  Trigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ children }: any) => <div data-testid="dialog-overlay">{children}</div>,
  Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  Title: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  Description: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  Close: ({ children }: any) => <div data-testid="dialog-close">{children}</div>,
}));

// Mock Lucide Icons comprehensively
jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      return (props: any) => <div data-testid={`icon-${String(prop)}`} {...props} />;
    }
  });
});

// Mock the UI components that use these primitives if they still cause issues
// But usually mocking the primitives is enough.

export class Router {
  private routes: { [path: string]: () => void } = {};
  private rootElement: HTMLElement;

  constructor(rootElementId: string) {
    const el = document.getElementById(rootElementId);
    if (!el) throw new Error(`Element with id ${rootElementId} not found`);
    this.rootElement = el;

    window.addEventListener('popstate', () => this.handleRoute());
  }

  addRoute(path: string, renderFunction: () => void) {
    this.routes[path] = renderFunction;
  }

  navigate(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const renderFunction = this.routes[path] || this.routes['/404'];
    
    // Clear root
    this.rootElement.innerHTML = '';
    
    if (renderFunction) {
      renderFunction();
    } else {
      this.rootElement.innerHTML = '<h1>404 Not Found</h1>';
    }
  }

  mount(content: string | HTMLElement) {
    if (typeof content === 'string') {
      this.rootElement.innerHTML = content;
    } else {
      this.rootElement.innerHTML = '';
      this.rootElement.appendChild(content);
    }
    
    // Animate enter
    this.rootElement.style.opacity = '0';
    this.rootElement.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
      this.rootElement.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      this.rootElement.style.opacity = '1';
      this.rootElement.style.transform = 'translateY(0)';
      
      // Emit event for DOM initialization
      window.dispatchEvent(new Event('route-mounted'));
    });
  }
}

export const router = new Router('app');

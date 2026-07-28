import { router } from '../router';
import { api } from '../api';

export function renderLogin() {
  const template = `
    <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; background: radial-gradient(circle at center, var(--surface-color-light) 0%, var(--bg-color) 100%);">
      <div class="glass-card" style="width: 100%; max-width: 400px; position: relative; z-index: 10;">
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--accent-color); filter: blur(100px); opacity: 0.3; border-radius: 50%; z-index: -1;"></div>
        <div style="position: absolute; bottom: -50px; left: -50px; width: 150px; height: 150px; background: var(--success-color); filter: blur(100px); opacity: 0.2; border-radius: 50%; z-index: -1;"></div>
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 id="loginTitle" style="font-size: 1.5rem; margin-bottom: 0.5rem; letter-spacing: -0.5px;">Welcome Back</h2>
          <p id="loginSubtitle" class="text-secondary" style="font-size: 0.875rem;">Sign in to SalesGenie AI</p>
        </div>

        <div id="loginError" style="display: none; background: rgba(255,107,107,0.1); color: var(--danger-color); padding: 0.75rem; border-radius: var(--border-radius-md); margin-bottom: 1rem; font-size: 0.875rem; text-align: center; border: 1px solid rgba(255,107,107,0.2);"></div>
        <div id="loginSuccess" style="display: none; background: rgba(0,201,167,0.1); color: var(--success-color); padding: 0.75rem; border-radius: var(--border-radius-md); margin-bottom: 1rem; font-size: 0.875rem; text-align: center; border: 1px solid rgba(0,201,167,0.2);">Registration successful! You can now login.</div>

        <form id="loginForm">
          <div id="nameContainer" style="display: none; margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--secondary-color); font-weight: 500;">FULL NAME</label>
            <input type="text" id="fullName" placeholder="John Doe" 
                   style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white; outline: none; transition: all 0.3s ease; box-sizing: border-box;"
                   onfocus="this.style.borderColor='var(--accent-color)'; this.style.boxShadow='0 0 0 2px var(--accent-glow)';"
                   onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';">
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--secondary-color); font-weight: 500;">EMAIL</label>
            <input type="email" id="email" required placeholder="you@company.com" 
                   style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white; outline: none; transition: all 0.3s ease; box-sizing: border-box;"
                   onfocus="this.style.borderColor='var(--accent-color)'; this.style.boxShadow='0 0 0 2px var(--accent-glow)';"
                   onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--secondary-color); font-weight: 500;">PASSWORD</label>
            <input type="password" id="password" required placeholder="••••••••" 
                   style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white; outline: none; transition: all 0.3s ease; box-sizing: border-box;"
                   onfocus="this.style.borderColor='var(--accent-color)'; this.style.boxShadow='0 0 0 2px var(--accent-glow)';"
                   onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';">
          </div>

          <button id="submitBtn" type="submit" 
                  style="width: 100%; padding: 0.875rem; border-radius: var(--border-radius-md); border: none; background: var(--accent-color); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;"
                  onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px var(--accent-glow)';"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            Sign In
          </button>
        </form>
        
        <div style="text-align: center; font-size: 0.875rem; color: var(--secondary-color);">
          Don't have an account? <a href="#" id="toggleMode" style="color: white; text-decoration: none; font-weight: 500;">Register Here</a>
        </div>
      </div>
    </div>
  `;
  router.mount(template);

  let isLogin = true;
  const form = document.getElementById('loginForm') as HTMLFormElement;
  const toggleBtn = document.getElementById('toggleMode') as HTMLAnchorElement;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const errorDiv = document.getElementById('loginError') as HTMLDivElement;
  const successDiv = document.getElementById('loginSuccess') as HTMLDivElement;
  const loginTitle = document.getElementById('loginTitle') as HTMLHeadingElement;
  const loginSubtitle = document.getElementById('loginSubtitle') as HTMLParagraphElement;
  const nameContainer = document.getElementById('nameContainer') as HTMLDivElement;
  const fullNameInput = document.getElementById('fullName') as HTMLInputElement;

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    submitBtn.innerText = isLogin ? 'Sign In' : 'Create Account';
    toggleBtn.innerText = isLogin ? 'Register Here' : 'Sign In instead';
    loginTitle.innerText = isLogin ? 'Welcome Back' : 'Create an Account';
    loginSubtitle.innerText = isLogin ? 'Sign in to SalesGenie AI' : 'Join SalesGenie AI today';
    nameContainer.style.display = isLogin ? 'none' : 'block';
    if (!isLogin) fullNameInput.required = true;
    else fullNameInput.required = false;
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerText = 'Loading...';

    const email = emailInput.value;
    const password = passwordInput.value;
    const fullName = fullNameInput.value;

    try {
      if (isLogin) {
        // Login Flow
        const res = await api.post('/auth/login', {
          username: email,
          password: password
        }, true); // isForm = true for OAuth2PasswordRequestForm
        
        localStorage.setItem('token', res.access_token);
        router.navigate('/');
      } else {
        // Registration Flow
        await api.post('/auth/register', {
          email: email,
          password: password,
          full_name: fullName || email.split('@')[0],
          is_active: true,
          role: "user"
        });
        
        // Auto switch back to login
        isLogin = true;
        submitBtn.innerText = 'Sign In';
        toggleBtn.innerText = 'Register Here';
        loginTitle.innerText = 'Welcome Back';
        loginSubtitle.innerText = 'Sign in to SalesGenie AI';
        successDiv.style.display = 'block';
        passwordInput.value = '';
        localStorage.setItem('just_registered', email);
      }
    } catch (err: any) {
      errorDiv.innerText = err.message || 'An error occurred';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      if (isLogin) submitBtn.innerText = 'Sign In';
      else submitBtn.innerText = 'Create Account';
    }
  });
}

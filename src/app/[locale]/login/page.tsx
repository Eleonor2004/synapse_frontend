 import { LoginForm } from '../../../components/auth/LoginForm';
  import Image from 'next/image';  
  const bg_light = "/images/login/login_image_light.jpg"; 
  const bg_dark = "/images/login/login_image_dark.jpg";  
  export default function LoginPage() {   
    return (    
       <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">    
          <div className="flex items-center justify-center p-8 bg-background">     
                <LoginForm />     
                  </div>       
                  <div className="hidden md:block relative bg-background">         {/* Light Theme Image: Visible by default, hidden in dark mode */}        
                     <Image           src={bg_light}           alt="Abstract network visualization for light theme"           layout="fill"           objectFit="cover"           priority           className="dark:hidden" 
                    />        
                    <Image           src={bg_dark}           alt="Abstract network visualization for dark theme"           layout="fill"           objectFit="cover"           priority           className="hidden dark:block"    />    
                         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />    
                            </div>   
                  </div>   ); }
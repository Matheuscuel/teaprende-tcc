'use client';
import {useEffect} from "react";
export default function NavFix(){
  useEffect(()=>{
    // Não modificar Links do Next.js - deixar navegação funcionar normalmente
    // Este componente não interfere mais no link "Quem usa" que agora vai para /quem-usa
  },[]);
  return null;
}
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
    const [value, setvalue] = useState(()=>{
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : initialValue;
    })

useEffect(()=>{
    localStorage.setItem(key, JSON.stringify(value))
})
}
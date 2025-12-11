'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('https://www.matinhomes.ca/')
      .then(res => res.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const header = doc.querySelector('header');
        setHtml(header?.outerHTML || '');
      });
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

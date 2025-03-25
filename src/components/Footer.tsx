
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background py-3 text-center text-sm text-muted-foreground border-t border-border">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} LearnMate, By Puje & Tibu</p>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';

/** Simple card wrapper */
export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

/** Card header section */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

/** Card body section */
export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export default Card;

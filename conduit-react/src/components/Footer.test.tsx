import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
}

describe('Footer', () => {
  it('should render conduit link', () => {
    renderFooter();

    expect(screen.getByText('conduit')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    renderFooter();

    expect(screen.getByText(/An interactive learning project/)).toBeInTheDocument();
  });

  it('should render RealWorld OSS Project link', () => {
    renderFooter();

    const link = screen.getByText('RealWorld OSS Project');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/gothinkster/realworld');
  });

  it('should render MIT license text', () => {
    renderFooter();

    expect(screen.getByText(/Code licensed under MIT/)).toBeInTheDocument();
  });

  it('should have correct href for conduit link', () => {
    renderFooter();

    const conduitLink = screen.getByText('conduit').closest('a');
    expect(conduitLink).toHaveAttribute('href', '/');
  });

  it('should display current year', () => {
    renderFooter();

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});

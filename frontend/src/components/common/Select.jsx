import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = '请选择',
  className = '',
  disabled = false,
  searchEnabled = false,
  label = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = useCallback(() => {
    if (!searchEnabled || !searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(term) ||
      opt.value.toLowerCase().includes(term)
    );
  }, [options, searchTerm, searchEnabled]);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchEnabled && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchEnabled]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    const filtered = filteredOptions();

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < filtered.length) {
            handleSelect(filtered[focusedIndex]);
          }
        } else {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        if (searchEnabled && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          searchInputRef.current?.focus();
        }
        break;
    }
  };

  const handleContainerClick = () => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      setFocusedIndex(options.findIndex(opt => opt.value === value));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(0);
  };

  return (
    <div 
      ref={containerRef}
      className={`custom-select ${className}`}
      style={{ position: 'relative' }}
    >
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}
      
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-controls={isOpen ? 'select-dropdown' : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={handleContainerClick}
        onKeyDown={handleKeyDown}
        className={`
          custom-select-trigger
          ${isOpen ? 'custom-select-open' : ''}
          ${disabled ? 'custom-select-disabled' : ''}
        `}
      >
        <span className={`custom-select-value ${!selectedOption ? 'custom-select-placeholder' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="custom-select-arrow">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div 
          id="select-dropdown"
          ref={dropdownRef}
          role="listbox"
          className="custom-select-dropdown"
          style={{ 
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999
          }}
        >
          {searchEnabled && (
            <div className="custom-select-search">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="搜索..."
                className="custom-select-search-input"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          )}
          
          <div className="custom-select-options">
            {(label || placeholder) && (
              <div className="custom-select-header">
                {label || placeholder}
              </div>
            )}
            {filteredOptions().length === 0 ? (
              <div className="custom-select-no-results">
                没有找到结果
              </div>
            ) : (
              filteredOptions().map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={0}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(option);
                    }
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    custom-select-option
                    ${option.value === value ? 'custom-select-option-selected' : ''}
                    ${focusedIndex === index ? 'custom-select-option-focused' : ''}
                  `}
                >
                  <span className="custom-select-option-label">{option.label}</span>
                  {option.value === value && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="custom-select-check"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="custom-select-footer">
            <span className="custom-select-hint">
              使用 ↑↓ 键导航，Enter 键选择，Esc 键关闭
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

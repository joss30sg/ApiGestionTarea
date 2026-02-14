/* Mock de componentes personalizados */

const React = require('react');

// Mock genérico para cualquier componente
const MockComponent = (props) => {
  const displayName = props['testID'] || 'Component';
  return React.createElement('View', { testID: displayName }, displayName);
};

module.exports = {
  FilterButton: MockComponent,
  TaskCard: MockComponent,
  EmptyState: (props) => React.createElement('View', { testID: 'EmptyState' }, 
    props.title || 'Empty'
  ),
};

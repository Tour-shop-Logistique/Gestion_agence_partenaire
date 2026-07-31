# Requirements Document

## Introduction

Cette fonctionnalité ajoute une card KPI dans la section des indicateurs de la page TarifsSimples.jsx pour afficher le nombre de tarifs de base qui ne sont pas encore configurés dans les tarifs de l'agence. Cela permet aux utilisateurs d'identifier rapidement les tarifs manquants et de suivre la progression de la configuration.

## Glossary

- **TarifSimpleComponent**: Composant React qui affiche et gère les tarifs simples de l'agence
- **Tarif_de_Base**: Tarif de référence provenant du backoffice, stocké dans `flatTarifs`
- **Tarif_Agence**: Tarif configuré par l'agence basé sur un tarif de base, stocké dans `flatExistingTarifs`
- **Tarif_Non_Configuré**: Un Tarif_de_Base qui n'a pas de Tarif_Agence correspondant avec le même `indice` et `zone_destination_id`
- **KPI_Card**: Composant visuel affichant un indicateur clé de performance avec un titre, une valeur numérique et une icône
- **Comparison_Logic**: Algorithme qui compare les deux listes de tarifs pour identifier les tarifs non configurés

## Requirements

### Requirement 1: Calcul des Tarifs Non Configurés

**User Story:** En tant qu'utilisateur de l'agence, je veux voir le nombre de tarifs de base non configurés, afin de savoir combien de tarifs restent à configurer.

#### Acceptance Criteria

1. WHEN THE TarifSimpleComponent loads, THE Comparison_Logic SHALL calculate the count of unconfigured base tariffs
2. THE Comparison_Logic SHALL compare each Tarif_de_Base with all Tarif_Agence entries based on `indice` and `zone_destination_id`
3. THE Comparison_Logic SHALL identify a Tarif_de_Base as Tarif_Non_Configuré if no Tarif_Agence has matching `indice` and `zone_destination_id`
4. THE Comparison_Logic SHALL return the total count of Tarif_Non_Configuré items
5. WHEN `flatTarifs` or `flatExistingTarifs` data changes, THE Comparison_Logic SHALL recalculate the count automatically

### Requirement 2: Affichage de la Card KPI

**User Story:** En tant qu'utilisateur, je veux voir une card KPI visuellement cohérente avec les cards existantes, afin d'avoir une interface harmonieuse.

#### Acceptance Criteria

1. THE KPI_Card SHALL display the count of Tarif_Non_Configuré items as a numeric value
2. THE KPI_Card SHALL use a gradient background color scheme consistent with existing cards (rose/pink or orange palette)
3. THE KPI_Card SHALL display an appropriate Heroicons icon representing unconfigured or missing items
4. THE KPI_Card SHALL include a descriptive label such as "Tarifs Non Configurés" or "À Configurer"
5. THE KPI_Card SHALL use text styling consistent with existing KPI cards (size, weight, color)
6. THE KPI_Card SHALL be positioned as the fourth card in the KPI grid

### Requirement 3: Intégration dans la Grille

**User Story:** En tant qu'utilisateur, je veux que la nouvelle card s'intègre naturellement dans la mise en page, afin d'avoir une expérience visuelle cohérente.

#### Acceptance Criteria

1. THE TarifSimpleComponent SHALL update the KPI grid from 3 columns to 4 columns
2. WHILE the viewport is on desktop size, THE KPI grid SHALL display all 4 cards in a single row
3. WHILE the viewport is on tablet size, THE KPI grid SHALL display cards in 2 rows of 2 cards
4. WHILE the viewport is on mobile size, THE KPI grid SHALL display cards in a single column
5. THE KPI_Card SHALL maintain consistent spacing and alignment with existing cards

### Requirement 4: Optimisation des Performances

**User Story:** En tant que développeur, je veux que le calcul soit optimisé, afin de ne pas impacter les performances de l'application.

#### Acceptance Criteria

1. THE Comparison_Logic SHALL use React `useMemo` hook to memoize the calculation result
2. THE Comparison_Logic SHALL only recalculate when `flatTarifs` or `flatExistingTarifs` dependencies change
3. THE Comparison_Logic SHALL complete the calculation within 100ms for datasets up to 1000 tariffs
4. THE Comparison_Logic SHALL use efficient lookup algorithms (e.g., Set or Map) instead of nested loops

### Requirement 5: Gestion des États

**User Story:** En tant qu'utilisateur, je veux voir des états appropriés pendant le chargement et en l'absence de données, afin de comprendre ce qui se passe.

#### Acceptance Criteria

1. WHILE data is loading, THE KPI_Card SHALL display a loading skeleton or "0" as a fallback value
2. WHEN `flatTarifs` is empty, THE KPI_Card SHALL display "0" as the count
3. WHEN `flatExistingTarifs` is empty, THE KPI_Card SHALL display the total count of `flatTarifs`
4. WHEN both lists are empty, THE KPI_Card SHALL display "0" as the count
5. THE KPI_Card SHALL handle null or undefined data gracefully without throwing errors

### Requirement 6: Accessibilité et Responsive Design

**User Story:** En tant qu'utilisateur mobile, je veux que la card s'affiche correctement sur tous les appareils, afin d'avoir une expérience cohérente.

#### Acceptance Criteria

1. THE KPI_Card SHALL be fully responsive using Tailwind CSS classes
2. THE KPI_Card SHALL maintain readable text sizes on mobile devices (minimum 14px for values)
3. THE KPI_Card SHALL maintain adequate touch target sizes on mobile (minimum 44x44px for interactive elements)
4. THE KPI_Card SHALL use appropriate semantic HTML elements for screen readers
5. THE KPI_Card SHALL maintain color contrast ratios meeting WCAG AA standards (minimum 4.5:1 for normal text)

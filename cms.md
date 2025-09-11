# CMS Configuration

CMS is directus on for access contact cpatino@copaair.com

## 1 - Entities

1.1. Hotels (PROMTOUR)
1.2. Restaurants (ATP)
1.3. Activities (ATP)
1.4. Tours (PROMTOUR)
1.5. Packages (PROMTOUR)
1.6. Transportation (PROMTOUR)
1.7. Events (Pending)

Explain how it creates one page per row in each entity and what should be considered an entity

## 2 - New Entity

For new entities certain rules must be follow

- Permissions for dev, prod and preview
- Flow to set the page path
- Flows to duplicate and update status
- Inclussion in code

Assign path flow expling

## 3 - Approval Flow

Explain each flow that allow each step
Approval flow is based on the authority but the regular approval flow is 
1. Internal (Partner)
2. Authority (ATP/PROMTOUR)
3. Copa Airlines 

Guidelines for content approval.

## 4 - Duplication Flow

Explain that the duplication is on an entity basis and that is should be set up to create the rows as a new object of that entity type and build it so it mimics duplication, and it should later assign the old version as it parent

## 5 - Permissions

1. dev permissions should allow all content to be seen, conflicts on URL should prioritize published content / pages.
2. prod permissions should only allow published content and pages.
3. 

## 6 - Preview Mode

Preview mode should be included on the entity translation related table, not the entity

## 7 - Pages

Explain whats the diference between entities. and how to set them up
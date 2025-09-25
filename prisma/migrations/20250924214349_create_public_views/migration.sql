CREATE OR REPLACE VIEW v_public_travelers AS
SELECT
  t.id  AS traveler_id,
  r.id  AS reservation_id,
  CONCAT(LEFT(t.first_name, 1), '. ',
         TRIM(CONCAT(t.last_name_1, ' ', COALESCE(t.last_name_2, '')))
  ) AS display_traveler,
  (
    SELECT STRING_AGG(DISTINCT TRIM(CONCAT(t2.last_name_1, ' ', COALESCE(t2.last_name_2, ''))), ', ')
    FROM travelers t2 WHERE t2.reservation_id = r.id
  ) AS reservation_last_names,
  r.arrival_pty_at, r.departure_pty_at,
  CASE
    WHEN CURRENT_DATE < r.arrival_pty_at THEN 'upcoming'
    WHEN CURRENT_DATE > r.departure_pty_at THEN 'completed'
    ELSE 'in_progress' END AS phase
FROM travelers t JOIN reservations r ON r.id = t.reservation_id;

CREATE OR REPLACE VIEW v_public_reservations AS
SELECT
  r.id AS reservation_id,
  (
    SELECT STRING_AGG(DISTINCT TRIM(CONCAT(t2.last_name_1, ' ', COALESCE(t2.last_name_2, ''))), ', ')
    FROM travelers t2 WHERE t2.reservation_id = r.id
  ) AS reservation_last_names,
  r.arrival_pty_at, r.departure_pty_at,
  CASE
    WHEN CURRENT_DATE < r.arrival_pty_at THEN 'upcoming'
    WHEN CURRENT_DATE > r.departure_pty_at THEN 'completed'
    ELSE 'in_progress' END AS phase
FROM reservations r;

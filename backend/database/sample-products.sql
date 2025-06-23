-- Insert sample products for Sleep Ready
INSERT INTO products (
    id, name, description, category, brand, model, sku, 
    price, cost, commission_rate, stock_quantity, min_stock,
    features, specifications, images, tags, warranty_months
) VALUES
-- Mattresses
('prod-001', 'DreamCloud Luxury Hybrid', 'Premium hybrid mattress with gel memory foam and innerspring coils', 
 'Mattresses', 'DreamCloud', 'DCL-HYB-2024', 'MAT-DC-001', 
 1299.99, 650.00, 10.00, 25, 5,
 '{"cooling_technology": true, "edge_support": true, "motion_isolation": true}',
 '{"firmness": "6.5/10", "height": "14 inches", "materials": ["gel memory foam", "coils"], "sizes": ["Twin", "Full", "Queen", "King"]}',
 '{"mattress-dreamcloud-1.jpg", "mattress-dreamcloud-2.jpg"}',
 '{"luxury", "hybrid", "cooling", "bestseller"}',
 120),

('prod-002', 'Sealy Posturepedic Plus', 'Orthopedic support mattress with targeted zones', 
 'Mattresses', 'Sealy', 'SPP-ORTHO-2024', 'MAT-SEA-002', 
 999.99, 500.00, 8.00, 15, 5,
 '{"orthopedic_support": true, "zoned_support": true, "hypoallergenic": true}',
 '{"firmness": "7/10", "height": "12 inches", "materials": ["memory foam", "support foam"], "sizes": ["Twin", "Full", "Queen", "King"]}',
 '{"mattress-sealy-1.jpg", "mattress-sealy-2.jpg"}',
 '{"orthopedic", "firm", "support"}',
 60),

('prod-003', 'SleepWell Memory Plus', 'Affordable memory foam mattress with pressure relief', 
 'Mattresses', 'SleepWell', 'SW-MEM-2024', 'MAT-SW-003', 
 599.99, 300.00, 7.00, 30, 10,
 '{"pressure_relief": true, "certipur_certified": true}',
 '{"firmness": "5/10", "height": "10 inches", "materials": ["memory foam"], "sizes": ["Twin", "Full", "Queen", "King"]}',
 '{"mattress-sleepwell-1.jpg"}',
 '{"budget", "memory foam", "soft"}',
 36),

-- Pillows
('prod-004', 'ErgoSupport Memory Pillow', 'Contoured memory foam pillow for neck support', 
 'Pillows', 'ErgoSupport', 'ES-PILLOW-01', 'PIL-ERG-001', 
 79.99, 35.00, 15.00, 50, 10,
 '{"contoured_design": true, "cooling_gel": true, "washable_cover": true}',
 '{"material": "memory foam", "height": "adjustable", "firmness": "medium"}',
 '{"pillow-ergo-1.jpg", "pillow-ergo-2.jpg"}',
 '{"ergonomic", "cooling", "neck support"}',
 24),

('prod-005', 'CloudSoft Down Alternative', 'Hypoallergenic down alternative pillow', 
 'Pillows', 'CloudSoft', 'CS-DOWN-ALT', 'PIL-CS-002', 
 49.99, 20.00, 12.00, 75, 15,
 '{"hypoallergenic": true, "machine_washable": true}',
 '{"material": "polyester fill", "firmness": "soft", "fill_weight": "20oz"}',
 '{"pillow-cloudsoft-1.jpg"}',
 '{"soft", "hypoallergenic", "washable"}',
 12),

-- Bedding
('prod-006', 'Bamboo Luxury Sheet Set', 'Ultra-soft bamboo viscose sheet set', 
 'Bedding', 'BambooLux', 'BL-SHEET-QN', 'BED-BL-001', 
 149.99, 65.00, 10.00, 40, 8,
 '{"moisture_wicking": true, "temperature_regulating": true, "wrinkle_resistant": true}',
 '{"material": "100% bamboo viscose", "thread_count": "300", "pieces": "4-piece set"}',
 '{"sheets-bamboo-1.jpg", "sheets-bamboo-2.jpg"}',
 '{"bamboo", "cooling", "luxury", "eco-friendly"}',
 12),

('prod-007', 'Weighted Comfort Blanket', 'Therapeutic weighted blanket for better sleep', 
 'Bedding', 'ComfortZone', 'CZ-WEIGHT-15', 'BED-CZ-002', 
 99.99, 45.00, 8.00, 35, 5,
 '{"anxiety_relief": true, "glass_beads": true, "removable_cover": true}',
 '{"weight": "15 lbs", "size": "60x80 inches", "material": "cotton cover"}',
 '{"blanket-weighted-1.jpg"}',
 '{"weighted", "therapeutic", "anxiety relief"}',
 12),

-- Accessories
('prod-008', 'SleepTrack Pro Monitor', 'Advanced sleep tracking device with app', 
 'Accessories', 'SleepTech', 'ST-TRACK-PRO', 'ACC-ST-001', 
 199.99, 100.00, 12.00, 20, 5,
 '{"heart_rate_monitor": true, "sleep_stages": true, "smart_alarm": true, "app_connectivity": true}',
 '{"battery_life": "7 days", "connectivity": "Bluetooth 5.0", "water_resistant": "IP67"}',
 '{"tracker-1.jpg", "tracker-2.jpg"}',
 '{"tech", "tracking", "smart", "health"}',
 24),

('prod-009', 'AromaTherapy Sleep Diffuser', 'Essential oil diffuser with sleep timer', 
 'Accessories', 'ZenSleep', 'ZS-DIFF-01', 'ACC-ZS-002', 
 59.99, 25.00, 10.00, 45, 10,
 '{"timer_function": true, "color_therapy": true, "quiet_operation": true}',
 '{"capacity": "300ml", "runtime": "8 hours", "coverage": "300 sq ft"}',
 '{"diffuser-1.jpg"}',
 '{"aromatherapy", "relaxation", "wellness"}',
 12),

('prod-010', 'Anti-Snore Comfort Band', 'Adjustable chin strap for snore reduction', 
 'Accessories', 'QuietNight', 'QN-BAND-01', 'ACC-QN-003', 
 29.99, 10.00, 20.00, 100, 20,
 '{"adjustable": true, "breathable": true, "comfortable": true}',
 '{"material": "neoprene", "size": "one size fits most"}',
 '{"snore-band-1.jpg"}',
 '{"anti-snore", "comfort", "sleep aid"}',
 6);

-- Update the updated_at timestamp
UPDATE products SET updated_at = NOW() WHERE created_at IS NOT NULL;

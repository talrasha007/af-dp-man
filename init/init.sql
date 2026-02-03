DROP TABLE IF EXISTS pb_order;

CREATE TABLE pb_order (
    order_num VARCHAR(50) PRIMARY KEY,
    account VARCHAR(50) NOT NULL,
    s_amount DECIMAL(10, 2) NOT NULL,
    e_commis DECIMAL(10, 2) NOT NULL,
    c_time TIMESTAMP NOT NULL,
    p_time TIMESTAMP NOT NULL,
    region VARCHAR(10),
    device VARCHAR(20),
    tracking TEXT,
    coupon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pb_order_p_time ON pb_order(p_time);

DROP TABLE IF EXISTS pb_stats;
CREATE TABLE pb_stats (
    hour TIMESTAMP,
    account VARCHAR(50),
    region VARCHAR(10),
    total_orders INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    total_commission DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (hour, account, region)
);

DROP TABLE IF EXISTS permission;
CREATE TABLE permission (
    account VARCHAR(50) PRIMARY KEY,
    permissions TEXT NOT NULL
);

DROP TABLE IF EXISTS account;
CREATE TABLE account (
    account VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    api_key VARCHAR(100) NOT NULL,
    api_secret VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
    app_id    VARCHAR(50) PRIMARY KEY,
    app_name  VARCHAR(100),
    icon_url  VARCHAR(255),
    disabled  BOOLEAN DEFAULT FALSE,

    countries JSON,
    proxy     TEXT,
    
    send_page_view  BOOLEAN,
    use_page_view   BOOLEAN,
    page_click      VARCHAR(255),
    page_click_rate INT,
    prefix          VARCHAR(50),

    click_duration INT,
    click_ratio    FLOAT
);

DROP TABLE IF EXISTS task_items;
CREATE TABLE task_items (
    id              VARCHAR(50) PRIMARY KEY,
    disabled        BOOLEAN DEFAULT FALSE,
    task_id         VARCHAR(50),

    deep_link_value TEXT,
    custom_params   JSON,

    weight            INT,
    page_url          TEXT,
    impact_url        TEXT,
    redirect_until    TEXT,
    item_name         VARCHAR(255),
    use_impact_return BOOLEAN,
    use_impact_click  BOOLEAN
);

CREATE INDEX idx_task_items_task_id ON task_items(task_id);

DROP TABLE IF EXISTS apps;
CREATE TABLE apps (
    app_id    VARCHAR(50) PRIMARY KEY,
    app_name  VARCHAR(100),
    dev_key   VARCHAR(100)
);

INSERT INTO apps (app_id, app_name, dev_key) VALUES
    ('com.dhgate.buyermob', 'DHgate', 'wAueXqnTbMD65NFK9TsKS7'),
    ('id905869418', 'DHgate', 'wAueXqnTbMD65NFK9TsKS7'),
    ('id1488296980', 'Bybit', '4zHVm78oXAwhdzUHGdMLG5'),
    ('id1327268470', 'Okx', '72dSCzRabQdYPRkgKNdcDf'),
    ('id1436799971', 'Binance', 'eLMsxedcvJSiwQHyd362JT'),
    ('id835599320', 'Tiktok', 'XY8Lpakui8g4kBcposRgxA'),
    ('id1170055821', 'Phone Pe', 'R2PcxTzKKaWVyMakREG6X9'),
    ('id1294998195', 'Gate IO', 'QVwwgUkb2zTuorMkekmprA'),
    ('id1537797105', 'Melbet', 'zDyQGBL6mnJ2QDFTjAQT36');
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
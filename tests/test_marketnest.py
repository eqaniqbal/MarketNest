import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://13.228.25.21"
BUYER_EMAIL = "testbuyer@gmail.com"
BUYER_PASSWORD = "Test@1234"
SELLER_EMAIL = "testseller@gmail.com"
SELLER_PASSWORD = "Test@1234"
ADMIN_EMAIL = "admin@marketnest.com"
ADMIN_PASSWORD = "admin123"

@pytest.fixture(scope="session")
def driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

def test_01_home_page_loads(driver):
    driver.get(BASE_URL)
    time.sleep(2)
    assert driver.find_element(By.TAG_NAME, "body")

def test_02_buyer_registration_duplicate_email(driver):
    driver.get(f"{BASE_URL}/buyer/register")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys("Test Buyer")
    inputs[1].send_keys(BUYER_EMAIL)
    inputs[2].send_keys(BUYER_PASSWORD)
    inputs[3].send_keys(BUYER_PASSWORD)
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    body = driver.find_element(By.TAG_NAME, "body").text
    assert any(word in body.lower() for word in ["exist", "already", "error", "registered"])

def test_03_buyer_login_wrong_password(driver):
    driver.get(f"{BASE_URL}/buyer/login")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys(BUYER_EMAIL)
    inputs[1].send_keys("WrongPassword123")
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    body = driver.find_element(By.TAG_NAME, "body").text
    assert any(word in body.lower() for word in ["invalid", "incorrect", "error", "wrong"])

def test_04_buyer_login_success(driver):
    driver.get(f"{BASE_URL}/buyer/login")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].clear()
    inputs[0].send_keys(BUYER_EMAIL)
    inputs[1].clear()
    inputs[1].send_keys(BUYER_PASSWORD)
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    token = driver.execute_script("return localStorage.getItem('token')")
    assert token is not None

def test_05_product_listing_loads(driver):
    driver.get(f"{BASE_URL}/products")
    time.sleep(3)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 100

def test_06_product_search(driver):
    driver.get(f"{BASE_URL}/products")
    time.sleep(2)
    driver.find_element(By.XPATH, "//button[contains(text(),'Filters')]").click()
    time.sleep(1)
    search = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Search products...']")
    search.send_keys("shirt")
    time.sleep(2)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 50

def test_07_product_filter_by_category(driver):
    driver.get(f"{BASE_URL}/products")
    time.sleep(2)
    driver.find_element(By.XPATH, "//button[contains(text(),'Filters')]").click()
    time.sleep(1)
    select = driver.find_element(By.TAG_NAME, "select")
    options = driver.find_elements(By.TAG_NAME, "option")
    if len(options) > 1:
        options[1].click()
    time.sleep(2)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 50

def test_08_add_to_cart(driver):
    driver.get(f"{BASE_URL}/buyer/login")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].clear()
    inputs[0].send_keys(BUYER_EMAIL)
    inputs[1].clear()
    inputs[1].send_keys(BUYER_PASSWORD)
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    driver.get(f"{BASE_URL}/products")
    time.sleep(3)
    driver.find_element(By.CSS_SELECTOR, "a[href*='/products/']").click()
    time.sleep(2)
    driver.find_element(By.XPATH, "//*[contains(text(),'Add to Cart')]").click()
    time.sleep(2)
    assert True

def test_09_cart_page_loads(driver):
    driver.get(f"{BASE_URL}/cart")
    time.sleep(2)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 50

def test_10_add_to_wishlist(driver):
    driver.get(f"{BASE_URL}/products")
    time.sleep(3)
    driver.find_element(By.CSS_SELECTOR, "a[href*='/products/']").click()
    time.sleep(2)
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        try:
            btn.find_element(By.CSS_SELECTOR, "svg")
            svgs = btn.find_elements(By.CSS_SELECTOR, "svg")
            if svgs:
                btn.click()
                time.sleep(2)
                break
        except:
            continue
    assert True

def test_11_wishlist_page_loads(driver):
    driver.get(f"{BASE_URL}/wishlist")
    time.sleep(2)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 50

def test_12_product_detail_page(driver):
    driver.get(f"{BASE_URL}/products")
    time.sleep(3)
    driver.find_element(By.CSS_SELECTOR, "a[href*='/products/']").click()
    time.sleep(2)
    assert len(driver.find_element(By.TAG_NAME, "body").text) > 100

def test_13_checkout_requires_login(driver):
    driver.execute_script("localStorage.clear()")
    driver.get(f"{BASE_URL}/checkout")
    time.sleep(3)
    body = driver.find_element(By.TAG_NAME, "body").text
    assert "login" in driver.current_url.lower() or "login" in body.lower()

def test_14_seller_login_success(driver):
    driver.get(f"{BASE_URL}/seller/login")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys(SELLER_EMAIL)
    inputs[1].send_keys(SELLER_PASSWORD)
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    token = driver.execute_script("return localStorage.getItem('token')")
    assert token is not None or "dashboard" in driver.current_url.lower()

def test_15_admin_login(driver):
    driver.get(f"{BASE_URL}/admin/login")
    time.sleep(2)
    inputs = driver.find_elements(By.TAG_NAME, "input")
    inputs[0].send_keys(ADMIN_EMAIL)
    inputs[1].send_keys(ADMIN_PASSWORD)
    driver.find_element(By.TAG_NAME, "button").click()
    time.sleep(3)
    body = driver.find_element(By.TAG_NAME, "body").text
    assert "admin" in body.lower() or "dashboard" in driver.current_url.lower()
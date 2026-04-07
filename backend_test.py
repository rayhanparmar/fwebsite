import requests
import sys
import json
from datetime import datetime

class JewelleryB2BAPITester:
    def __init__(self, base_url="https://shree-mother-b2b.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.retailer_token = None
        self.retailer_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "jaysachetijs@gmail.com", "password": "pass@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_retailer_registration(self):
        """Test retailer registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "Retailer Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": f"Test Retailer {timestamp}",
                "email": f"retailer{timestamp}@test.com",
                "password": "TestPass123!",
                "business_name": f"Test Business {timestamp}",
                "gst_number": f"GST{timestamp}",
                "phone": "9876543210",
                "location": "Mumbai"
            }
        )
        if success and 'user' in response:
            self.retailer_id = response['user']['_id']
            print(f"   Retailer ID: {self.retailer_id}")
            return True, f"retailer{timestamp}@test.com", "TestPass123!"
        return False, None, None

    def test_unapproved_retailer_login(self, email, password):
        """Test that unapproved retailer cannot login"""
        success, response = self.run_test(
            "Unapproved Retailer Login (Should Fail)",
            "POST",
            "auth/login",
            403,  # Should get 403 for unapproved
            data={"email": email, "password": password}
        )
        return success

    def test_approve_retailer(self):
        """Test admin approving retailer"""
        if not self.admin_token or not self.retailer_id:
            print("❌ Cannot test approval - missing admin token or retailer ID")
            return False
        
        success, response = self.run_test(
            "Approve Retailer",
            "PUT",
            f"admin/retailers/{self.retailer_id}/approve",
            200,
            token=self.admin_token
        )
        return success

    def test_approved_retailer_login(self, email, password):
        """Test approved retailer login"""
        success, response = self.run_test(
            "Approved Retailer Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.retailer_token = response['token']
            print(f"   Retailer token obtained: {self.retailer_token[:20]}...")
            return True
        return False

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success and 'categories' in response:
            categories = response['categories']
            print(f"   Found {len(categories)} categories")
            if len(categories) == 16:
                print("   ✅ Correct number of categories (16)")
                return True
            else:
                print(f"   ❌ Expected 16 categories, got {len(categories)}")
        return False

    def test_get_products_by_category(self):
        """Test getting products by category"""
        success, response = self.run_test(
            "Get Products by Category (Rings)",
            "GET",
            "products?category=Rings",
            200
        )
        if success and 'products' in response:
            products = response['products']
            print(f"   Found {len(products)} products in Rings category")
            if len(products) == 30:
                print("   ✅ Correct number of products (30)")
                return True
            else:
                print(f"   ❌ Expected 30 products, got {len(products)}")
        return False

    def test_get_product_detail(self):
        """Test getting product detail"""
        # First get a product ID from rings category
        success, response = self.run_test(
            "Get Product for Detail Test",
            "GET",
            "products?category=Rings&limit=1",
            200
        )
        if not success or not response.get('products'):
            return False
        
        product_id = response['products'][0]['product_id']
        success, response = self.run_test(
            "Get Product Detail",
            "GET",
            f"products/{product_id}",
            200
        )
        return success and 'product' in response

    def test_cart_operations(self):
        """Test cart operations"""
        if not self.retailer_token:
            print("❌ Cannot test cart - no retailer token")
            return False

        # Get empty cart
        success, response = self.run_test(
            "Get Empty Cart",
            "GET",
            "cart",
            200,
            token=self.retailer_token
        )
        if not success:
            return False

        # Add item to cart
        success, response = self.run_test(
            "Add to Cart",
            "POST",
            "cart",
            200,
            data={
                "product_id": "RN-123456",
                "category": "Rings",
                "image": "https://example.com/ring.jpg",
                "customizations": {
                    "Metal Selection": "Yellow Gold",
                    "Metal Purity": "22KT",
                    "Stone Selection": "Diamond",
                    "Diamond Quality": "VS1",
                    "Diamond Color": "D",
                    "Size": "16"
                },
                "notes": "Test ring"
            },
            token=self.retailer_token
        )
        if not success:
            return False

        # Get cart with item
        success, response = self.run_test(
            "Get Cart with Items",
            "GET",
            "cart",
            200,
            token=self.retailer_token
        )
        return success and len(response.get('items', [])) > 0

    def test_submit_enquiry(self):
        """Test submitting enquiry"""
        if not self.retailer_token:
            print("❌ Cannot test enquiry - no retailer token")
            return False

        success, response = self.run_test(
            "Submit Enquiry",
            "POST",
            "enquiries",
            200,
            data={"notes": "Test enquiry from automated test"},
            token=self.retailer_token
        )
        return success and 'enquiry_id' in response

    def test_customisation_request(self):
        """Test customisation request"""
        if not self.retailer_token:
            print("❌ Cannot test customisation - no retailer token")
            return False

        success, response = self.run_test(
            "Submit Customisation Request",
            "POST",
            "customisation",
            200,
            data={
                "metal_type": "Yellow Gold",
                "stone_changes": "Add emerald center stone",
                "size_changes": "Size 18",
                "special_notes": "Test customisation request",
                "reference_description": "Custom ring design",
                "product_id": "RN-123456"
            },
            token=self.retailer_token
        )
        return success and 'custom_id' in response

    def test_contact_form(self):
        """Test contact form (no auth required)"""
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            200,
            data={
                "name": "Test User",
                "email": "test@example.com",
                "phone": "9876543210",
                "message": "Test contact message"
            }
        )
        return success

    def test_admin_stats(self):
        """Test admin stats"""
        if not self.admin_token:
            print("❌ Cannot test admin stats - no admin token")
            return False

        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token
        )
        if success:
            stats = response
            print(f"   Products: {stats.get('total_products', 0)}")
            print(f"   Retailers: {stats.get('total_retailers', 0)}")
            print(f"   Pending Approvals: {stats.get('pending_approvals', 0)}")
            return True
        return False

    def test_admin_retailers(self):
        """Test admin get retailers"""
        if not self.admin_token:
            print("❌ Cannot test admin retailers - no admin token")
            return False

        success, response = self.run_test(
            "Admin Get Retailers",
            "GET",
            "admin/retailers",
            200,
            token=self.admin_token
        )
        return success and 'retailers' in response

    def test_admin_enquiries(self):
        """Test admin get enquiries"""
        if not self.admin_token:
            print("❌ Cannot test admin enquiries - no admin token")
            return False

        success, response = self.run_test(
            "Admin Get Enquiries",
            "GET",
            "admin/enquiries",
            200,
            token=self.admin_token
        )
        return success and 'enquiries' in response

    def test_admin_products_by_category(self):
        """Test admin get products by category (Rings and Bangle)"""
        if not self.admin_token:
            print("❌ Cannot test admin products - no admin token")
            return False

        # Test Rings category
        success, response = self.run_test(
            "Admin Get Products - Rings Category",
            "GET",
            "admin/products?category=Rings&limit=30",
            200,
            token=self.admin_token
        )
        if success and 'products' in response:
            rings_count = len(response['products'])
            print(f"   Found {rings_count} products in Rings category")
            if rings_count != 30:
                print(f"   ⚠️  Expected 30 products, got {rings_count}")
        
        # Test Bangle category
        success2, response2 = self.run_test(
            "Admin Get Products - Bangle Category",
            "GET",
            "admin/products?category=Bangle&limit=30",
            200,
            token=self.admin_token
        )
        if success2 and 'products' in response2:
            bangle_count = len(response2['products'])
            print(f"   Found {bangle_count} products in Bangle category")
            if bangle_count != 30:
                print(f"   ⚠️  Expected 30 products, got {bangle_count}")
        
        return success and success2

    def test_admin_product_upload(self):
        """Test admin product upload with file"""
        if not self.admin_token:
            print("❌ Cannot test product upload - no admin token")
            return False

        # Create a simple test image file (1x1 pixel PNG)
        import io
        import base64
        
        # Minimal PNG data (1x1 transparent pixel)
        png_data = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
        )
        
        # Test creating new product
        timestamp = datetime.now().strftime('%H%M%S')
        test_product_id = f"TEST-{timestamp}"
        
        url = f"{self.base_url}/api/admin/products/upload"
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        files = {'file': ('test.png', io.BytesIO(png_data), 'image/png')}
        data = {
            'product_id': test_product_id,
            'category': 'Rings'
        }
        
        print(f"\n🔍 Testing Admin Product Upload - New Product...")
        self.tests_run += 1
        
        try:
            response = requests.post(url, headers=headers, files=files, data=data)
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                result = response.json()
                print(f"   Created product: {result.get('message', 'No message')}")
                
                # Test appending image to existing product
                print(f"\n🔍 Testing Admin Product Upload - Append to Existing...")
                self.tests_run += 1
                
                files2 = {'file': ('test2.png', io.BytesIO(png_data), 'image/png')}
                data2 = {
                    'product_id': test_product_id,  # Same product ID
                    'category': 'Rings'
                }
                
                response2 = requests.post(url, headers=headers, files=files2, data=data2)
                if response2.status_code == 200:
                    self.tests_passed += 1
                    print(f"✅ Passed - Status: {response2.status_code}")
                    result2 = response2.json()
                    print(f"   Appended image: {result2.get('message', 'No message')}")
                    
                    # Check if product has multiple images
                    if 'product' in result2 and len(result2['product'].get('images', [])) > 1:
                        print(f"   ✅ Product now has {len(result2['product']['images'])} images")
                        return True
                    else:
                        print(f"   ❌ Product should have multiple images")
                        return False
                else:
                    print(f"❌ Failed - Expected 200, got {response2.status_code}")
                    return False
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

def main():
    print("🚀 Starting Shree Mother Gold B2B API Tests")
    print("=" * 60)
    
    tester = JewelleryB2BAPITester()
    
    # Test sequence
    tests = [
        ("Admin Login", tester.test_admin_login),
        ("Get Categories", tester.test_get_categories),
        ("Get Products by Category", tester.test_get_products_by_category),
        ("Get Product Detail", tester.test_get_product_detail),
        ("Contact Form", tester.test_contact_form),
        ("Admin Stats", tester.test_admin_stats),
        ("Admin Get Retailers", tester.test_admin_retailers),
        ("Admin Get Enquiries", tester.test_admin_enquiries),
        ("Admin Products by Category", tester.test_admin_products_by_category),
        ("Admin Product Upload", tester.test_admin_product_upload),
    ]
    
    # Run basic tests first
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    # Test retailer flow
    print("\n" + "=" * 60)
    print("🔄 Testing Retailer Registration & Approval Flow")
    print("=" * 60)
    
    reg_success, retailer_email, retailer_password = tester.test_retailer_registration()
    if reg_success:
        tester.test_unapproved_retailer_login(retailer_email, retailer_password)
        if tester.test_approve_retailer():
            if tester.test_approved_retailer_login(retailer_email, retailer_password):
                tester.test_cart_operations()
                tester.test_submit_enquiry()
                tester.test_customisation_request()
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
            print(f"  - {failure['test']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
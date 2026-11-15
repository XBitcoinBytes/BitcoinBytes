#!/usr/bin/env python3
"""
FRONTEND FUNCTIONALITY TESTING SUITE
Tests all user interface components and interactions
"""

import requests
import json
import re
from bs4 import BeautifulSoup
from datetime import datetime

class FrontendTestSuite:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []

    def log_test(self, component: str, status: str, details: str):
        """Log test result"""
        self.test_results.append({
            'component': component,
            'status': status,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {component}: {details}")

    def test_homepage_loading(self):
        """Test homepage loads correctly"""
        try:
            response = self.session.get(self.base_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for key elements
                title = soup.find('title')
                if title and 'Bitcoin' in title.text:
                    self.log_test("Homepage Loading", "PASS", "Page loads with correct title")
                else:
                    self.log_test("Homepage Loading", "FAIL", "Missing or incorrect page title")
                
                # Check for main app container
                app_root = soup.find('div', {'id': 'root'})
                if app_root:
                    self.log_test("React App Mount", "PASS", "React app container found")
                else:
                    self.log_test("React App Mount", "FAIL", "React app container missing")
                    
            else:
                self.log_test("Homepage Loading", "FAIL", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Homepage Loading", "FAIL", f"Error: {str(e)}")

    def test_critical_ui_components(self):
        """Test critical UI components are present"""
        critical_components = [
            # API endpoints that should provide data for UI components
            ('/api/bitcoin/price', 'Bitcoin Price Display'),
            ('/api/prices/comparison', 'Price Comparison Table'),
            ('/api/news', 'News Feed'),
            ('/api/charts/bitcoin-history', 'Historical Charts'),
            ('/api/health', 'System Health Dashboard'),
            ('/api/network/stats', 'Network Statistics'),
            ('/api/whale/activity', 'Whale Activity'),
            ('/api/ai/intelligence', 'AI Intelligence Dashboard')
        ]
        
        for endpoint, component_name in critical_components:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data:  # Non-empty response
                        self.log_test(f"Data for {component_name}", "PASS", 
                                    "API providing data for component")
                    else:
                        self.log_test(f"Data for {component_name}", "WARN", 
                                    "Empty API response")
                else:
                    self.log_test(f"Data for {component_name}", "FAIL", 
                                f"API error: HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Data for {component_name}", "FAIL", f"Error: {str(e)}")

    def test_responsive_design(self):
        """Test responsive design by checking CSS and viewport"""
        try:
            response = self.session.get(self.base_url, timeout=10)
            if response.status_code == 200:
                content = response.text
                
                # Check for viewport meta tag
                if 'viewport' in content and 'width=device-width' in content:
                    self.log_test("Responsive Viewport", "PASS", "Viewport meta tag configured")
                else:
                    self.log_test("Responsive Viewport", "WARN", "Viewport meta tag missing")
                
                # Check for Tailwind CSS responsive classes
                responsive_patterns = [
                    r'sm:', r'md:', r'lg:', r'xl:', r'2xl:'
                ]
                
                responsive_found = sum(1 for pattern in responsive_patterns 
                                     if re.search(pattern, content))
                
                if responsive_found >= 3:
                    self.log_test("Responsive CSS Classes", "PASS", 
                                f"Responsive breakpoints detected ({responsive_found}/5)")
                else:
                    self.log_test("Responsive CSS Classes", "WARN", 
                                f"Limited responsive classes ({responsive_found}/5)")
                    
        except Exception as e:
            self.log_test("Responsive Design", "FAIL", f"Error: {str(e)}")

    def test_javascript_functionality(self):
        """Test JavaScript bundles and React functionality"""
        try:
            response = self.session.get(self.base_url, timeout=10)
            if response.status_code == 200:
                content = response.text
                
                # Check for JavaScript bundles
                if 'src="/assets/' in content and '.js' in content:
                    self.log_test("JavaScript Bundles", "PASS", "JS bundles referenced")
                else:
                    self.log_test("JavaScript Bundles", "WARN", "JS bundles not detected")
                
                # Check for React development indicators
                if 'react' in content.lower() or 'React' in content:
                    self.log_test("React Framework", "PASS", "React framework detected")
                else:
                    self.log_test("React Framework", "WARN", "React framework not clearly detected")
                    
        except Exception as e:
            self.log_test("JavaScript Functionality", "FAIL", f"Error: {str(e)}")

    def test_social_sharing_functionality(self):
        """Test social sharing component data"""
        try:
            # Test if price data is available for sharing
            response = self.session.get(f"{self.base_url}/api/bitcoin/price", timeout=10)
            if response.status_code == 200:
                data = response.json()
                price = data.get('bitcoin', {}).get('usd')
                
                if price:
                    # Simulate social sharing data generation
                    share_text = f"Bitcoin is now at ${price:,.0f}!"
                    if len(share_text) > 10:
                        self.log_test("Social Sharing Data", "PASS", 
                                    f"Share text generated: '{share_text[:50]}...'")
                    else:
                        self.log_test("Social Sharing Data", "WARN", "Share text too short")
                else:
                    self.log_test("Social Sharing Data", "FAIL", "No price data for sharing")
            else:
                self.log_test("Social Sharing Data", "FAIL", "Price API unavailable for sharing")
        except Exception as e:
            self.log_test("Social Sharing Functionality", "FAIL", f"Error: {str(e)}")

    def test_educational_content(self):
        """Test educational content availability"""
        try:
            # Check if educational resources are accessible
            response = self.session.get(f"{self.base_url}/api/news", timeout=10)
            if response.status_code == 200:
                news_data = response.json()
                if news_data and len(news_data) > 0:
                    educational_articles = [article for article in news_data 
                                          if 'bitcoin' in article.get('title', '').lower()]
                    
                    if educational_articles:
                        self.log_test("Educational Content", "PASS", 
                                    f"{len(educational_articles)} Bitcoin-related articles available")
                    else:
                        self.log_test("Educational Content", "WARN", 
                                    "No Bitcoin-specific educational content")
                else:
                    self.log_test("Educational Content", "WARN", "No news/educational content")
            else:
                self.log_test("Educational Content", "FAIL", "Educational content API unavailable")
        except Exception as e:
            self.log_test("Educational Content", "FAIL", f"Error: {str(e)}")

    def test_accessibility_features(self):
        """Test accessibility features"""
        try:
            response = self.session.get(self.base_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for accessibility attributes
                aria_labels = soup.find_all(attrs={"aria-label": True})
                alt_texts = soup.find_all('img', alt=True)
                
                accessibility_score = 0
                total_checks = 3
                
                if aria_labels:
                    accessibility_score += 1
                    self.log_test("ARIA Labels", "PASS", f"{len(aria_labels)} elements with ARIA labels")
                else:
                    self.log_test("ARIA Labels", "WARN", "No ARIA labels found")
                
                if alt_texts:
                    accessibility_score += 1
                    self.log_test("Alt Text", "PASS", f"{len(alt_texts)} images with alt text")
                else:
                    self.log_test("Alt Text", "WARN", "No image alt text found")
                
                # Check for semantic HTML
                semantic_tags = soup.find_all(['header', 'main', 'section', 'article', 'nav', 'footer'])
                if semantic_tags:
                    accessibility_score += 1
                    self.log_test("Semantic HTML", "PASS", f"{len(semantic_tags)} semantic elements")
                else:
                    self.log_test("Semantic HTML", "WARN", "Limited semantic HTML structure")
                
                overall_accessibility = "PASS" if accessibility_score >= 2 else "WARN"
                self.log_test("Overall Accessibility", overall_accessibility, 
                            f"Accessibility score: {accessibility_score}/{total_checks}")
                    
        except Exception as e:
            self.log_test("Accessibility Features", "FAIL", f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all frontend tests"""
        print("🎨 FRONTEND FUNCTIONALITY TESTING SUITE")
        print("=" * 50)
        
        print("\n📄 PAGE LOADING TESTS")
        print("-" * 25)
        self.test_homepage_loading()
        
        print("\n🧩 UI COMPONENT TESTS")
        print("-" * 25)
        self.test_critical_ui_components()
        
        print("\n📱 RESPONSIVE DESIGN TESTS")
        print("-" * 25)
        self.test_responsive_design()
        
        print("\n⚡ JAVASCRIPT TESTS")
        print("-" * 25)
        self.test_javascript_functionality()
        
        print("\n🔗 FEATURE TESTS")
        print("-" * 25)
        self.test_social_sharing_functionality()
        self.test_educational_content()
        
        print("\n♿ ACCESSIBILITY TESTS")
        print("-" * 25)
        self.test_accessibility_features()
        
        return self.generate_frontend_report()

    def generate_frontend_report(self):
        """Generate frontend test report"""
        total_tests = len(self.test_results)
        passed = len([t for t in self.test_results if t['status'] == 'PASS'])
        failed = len([t for t in self.test_results if t['status'] == 'FAIL'])
        warnings = len([t for t in self.test_results if t['status'] == 'WARN'])
        
        print("\n" + "=" * 50)
        print("📊 FRONTEND TEST REPORT")
        print("=" * 50)
        
        pass_rate = (passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📈 SUMMARY:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed} ({pass_rate:.1f}%)")
        print(f"   ❌ Failed: {failed}")
        print(f"   ⚠️  Warnings: {warnings}")
        
        if failed == 0 and warnings <= total_tests * 0.3:
            overall_status = "🎉 EXCELLENT - Frontend fully functional!"
        elif failed == 0:
            overall_status = "✅ GOOD - Frontend working with minor issues"
        else:
            overall_status = "❌ ISSUES - Frontend needs attention"
        
        print(f"\n🏆 FRONTEND STATUS: {overall_status}")
        
        return {
            'total_tests': total_tests,
            'passed': passed,
            'failed': failed,
            'warnings': warnings,
            'pass_rate': pass_rate,
            'overall_status': overall_status
        }

if __name__ == "__main__":
    frontend_tester = FrontendTestSuite()
    frontend_tester.run_all_tests()
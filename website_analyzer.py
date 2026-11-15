#!/usr/bin/env python3
"""
Comprehensive Website Security, SEO, and Performance Analyzer
Analyzes websites for security vulnerabilities, SEO optimization, and performance issues.
"""

import requests
import ssl
import socket
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import time
from datetime import datetime
import re
from typing import Dict, List, Tuple, Any

class WebsiteAnalyzer:
    def __init__(self, base_url: str, timeout: int = 30):
        """
        Initialize the website analyzer with base URL and timeout settings.
        
        Args:
            base_url: The base URL to analyze (e.g., 'http://localhost:5000')
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Website-Security-Analyzer/1.0'
        })
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'url': base_url,
            'issues': [],
            'recommendations': [],
            'scores': {}
        }

    def check_robots_sitemap(self) -> Dict[str, Any]:
        """Check for robots.txt and sitemap.xml files."""
        print("Checking robots.txt and sitemap.xml...")
        
        results = {}
        
        # Check robots.txt
        try:
            robots_response = self.session.get(f"{self.base_url}/robots.txt", timeout=self.timeout)
            results['robots_txt'] = {
                'exists': robots_response.status_code == 200,
                'status_code': robots_response.status_code,
                'content': robots_response.text[:500] if robots_response.status_code == 200 else None
            }
        except Exception as e:
            results['robots_txt'] = {'exists': False, 'error': str(e)}

        # Check sitemap.xml
        try:
            sitemap_response = self.session.get(f"{self.base_url}/sitemap.xml", timeout=self.timeout)
            results['sitemap_xml'] = {
                'exists': sitemap_response.status_code == 200,
                'status_code': sitemap_response.status_code,
                'content': sitemap_response.text[:500] if sitemap_response.status_code == 200 else None
            }
        except Exception as e:
            results['sitemap_xml'] = {'exists': False, 'error': str(e)}

        return results

    def validate_html(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Validate HTML structure and meta tags."""
        print("Validating HTML structure...")
        
        validation = {
            'doctype': bool(soup.find('html')),
            'lang_attribute': bool(soup.find('html', attrs={'lang': True})),
            'title': {
                'exists': bool(soup.find('title')),
                'content': soup.find('title').get_text() if soup.find('title') else None,
                'length': len(soup.find('title').get_text()) if soup.find('title') else 0
            },
            'meta_charset': bool(soup.find('meta', attrs={'charset': True})),
            'meta_description': {
                'exists': bool(soup.find('meta', attrs={'name': 'description'})),
                'content': soup.find('meta', attrs={'name': 'description'}).get('content') if soup.find('meta', attrs={'name': 'description'}) else None
            },
            'meta_viewport': bool(soup.find('meta', attrs={'name': 'viewport'})),
            'meta_keywords': bool(soup.find('meta', attrs={'name': 'keywords'}))
        }

        # Check heading structure
        headings = {}
        for i in range(1, 7):
            headings[f'h{i}'] = len(soup.find_all(f'h{i}'))
        
        validation['headings'] = headings

        # Check images
        images = soup.find_all('img')
        validation['images'] = {
            'total': len(images),
            'with_alt': len([img for img in images if img.get('alt')]),
            'without_alt': len([img for img in images if not img.get('alt')])
        }

        return validation

    def analyze_javascript(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Analyze JavaScript libraries and security patterns."""
        print("Analyzing JavaScript libraries and security...")
        
        scripts = soup.find_all('script')
        js_analysis = {
            'total_scripts': len(scripts),
            'external_scripts': [],
            'inline_scripts': 0,
            'security_issues': [],
            'libraries': []
        }

        # Common JavaScript library patterns
        library_patterns = {
            'react': r'react',
            'vue': r'vue',
            'angular': r'angular',
            'jquery': r'jquery',
            'bootstrap': r'bootstrap',
            'lodash': r'lodash',
            'axios': r'axios',
            'moment': r'moment'
        }

        for script in scripts:
            src = script.get('src')
            if src:
                js_analysis['external_scripts'].append(src)
                
                # Check for known libraries
                for lib_name, pattern in library_patterns.items():
                    if re.search(pattern, src.lower()):
                        js_analysis['libraries'].append(lib_name)
            else:
                js_analysis['inline_scripts'] += 1
                
                # Check for security issues in inline scripts
                script_content = script.get_text()
                if 'eval(' in script_content:
                    js_analysis['security_issues'].append('eval() usage detected')
                if 'innerHTML' in script_content:
                    js_analysis['security_issues'].append('innerHTML usage detected')
                if 'document.write' in script_content:
                    js_analysis['security_issues'].append('document.write() usage detected')

        return js_analysis

    def check_ssl_certificate(self) -> Dict[str, Any]:
        """Check SSL certificate details."""
        print("Checking SSL certificate...")
        
        parsed_url = urlparse(self.base_url)
        if parsed_url.scheme != 'https':
            return {'ssl_enabled': False, 'reason': 'HTTP connection, no SSL'}

        try:
            hostname = parsed_url.hostname
            port = parsed_url.port or 443
            
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    return {
                        'ssl_enabled': True,
                        'subject': dict(x[0] for x in cert['subject']),
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'version': cert['version'],
                        'serial_number': cert['serialNumber'],
                        'not_before': cert['notBefore'],
                        'not_after': cert['notAfter']
                    }
        except Exception as e:
            return {'ssl_enabled': False, 'error': str(e)}

    def check_security_headers(self) -> Dict[str, Any]:
        """Check security headers in HTTP response."""
        print("Checking security headers...")
        
        try:
            response = self.session.head(self.base_url, timeout=self.timeout)
            headers = response.headers
            
            security_headers = {
                'strict-transport-security': headers.get('Strict-Transport-Security'),
                'content-security-policy': headers.get('Content-Security-Policy'),
                'x-frame-options': headers.get('X-Frame-Options'),
                'x-content-type-options': headers.get('X-Content-Type-Options'),
                'x-xss-protection': headers.get('X-XSS-Protection'),
                'referrer-policy': headers.get('Referrer-Policy'),
                'permissions-policy': headers.get('Permissions-Policy')
            }
            
            return {
                'status_code': response.status_code,
                'headers': security_headers,
                'missing_headers': [k for k, v in security_headers.items() if not v]
            }
        except Exception as e:
            return {'error': str(e)}

    def test_api_endpoints(self) -> Dict[str, Any]:
        """Test critical API endpoints for availability."""
        print("Testing API endpoints...")
        
        endpoints = [
            '/api/prices/comparison',
            '/api/news',
            '/api/charts/bitcoin-history',
            '/api/network/stats',
            '/api/market/data',
            '/api/ai/intelligence',
            '/api/whale/activity'
        ]
        
        results = {}
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=self.timeout)
                response_time = time.time() - start_time
                
                results[endpoint] = {
                    'status_code': response.status_code,
                    'response_time': round(response_time, 3),
                    'content_length': len(response.content)
                }
            except Exception as e:
                results[endpoint] = {'error': str(e)}
        
        return results

    def measure_performance(self) -> Dict[str, Any]:
        """Measure website performance metrics."""
        print("Measuring performance...")
        
        try:
            start_time = time.time()
            response = self.session.get(self.base_url, timeout=self.timeout)
            total_time = time.time() - start_time
            
            return {
                'total_load_time': round(total_time, 3),
                'status_code': response.status_code,
                'content_length': len(response.content),
                'response_headers_count': len(response.headers)
            }
        except Exception as e:
            return {'error': str(e)}

    def generate_issues_and_recommendations(self, analysis_data: Dict[str, Any]) -> None:
        """Generate issues and recommendations based on analysis."""
        print("Generating issues and recommendations...")
        
        # Check HTML validation issues
        html_val = analysis_data.get('html_validation', {})
        
        if not html_val.get('title', {}).get('exists'):
            self.results['issues'].append({
                'severity': 'high',
                'category': 'SEO',
                'issue': 'Missing title tag',
                'description': 'Page is missing a title tag, critical for SEO'
            })
            self.results['recommendations'].append('Add a descriptive title tag to improve SEO')

        if not html_val.get('meta_description', {}).get('exists'):
            self.results['issues'].append({
                'severity': 'medium',
                'category': 'SEO',
                'issue': 'Missing meta description',
                'description': 'Page lacks meta description for search engines'
            })
            self.results['recommendations'].append('Add meta description tag with compelling page summary')

        if html_val.get('headings', {}).get('h1', 0) == 0:
            self.results['issues'].append({
                'severity': 'medium',
                'category': 'SEO',
                'issue': 'Missing H1 tag',
                'description': 'Page lacks primary heading (H1) for content structure'
            })
            self.results['recommendations'].append('Add H1 tag with primary page topic')

        # Check security issues
        js_analysis = analysis_data.get('javascript_analysis', {})
        for security_issue in js_analysis.get('security_issues', []):
            self.results['issues'].append({
                'severity': 'medium',
                'category': 'Security',
                'issue': f'JavaScript: {security_issue}',
                'description': 'Potentially unsafe JavaScript pattern detected'
            })

        # Check missing security headers
        security_headers = analysis_data.get('security_headers', {})
        missing_headers = security_headers.get('missing_headers', [])
        for header in missing_headers:
            if header in ['strict-transport-security', 'content-security-policy']:
                severity = 'high'
            else:
                severity = 'medium'
            
            self.results['issues'].append({
                'severity': severity,
                'category': 'Security',
                'issue': f'Missing security header: {header}',
                'description': f'Security header {header} not implemented'
            })

        # Performance recommendations
        performance = analysis_data.get('performance', {})
        load_time = performance.get('total_load_time', 0)
        if load_time > 3:
            self.results['issues'].append({
                'severity': 'medium',
                'category': 'Performance',
                'issue': 'Slow page load time',
                'description': f'Page loads in {load_time}s, exceeds 3s threshold'
            })
            self.results['recommendations'].append('Optimize page load time by compressing assets and reducing HTTP requests')

    def calculate_scores(self, analysis_data: Dict[str, Any]) -> None:
        """Calculate overall scores for different categories."""
        print("Calculating scores...")
        
        # SEO Score (0-100)
        seo_score = 100
        html_val = analysis_data.get('html_validation', {})
        
        if not html_val.get('title', {}).get('exists'):
            seo_score -= 25
        if not html_val.get('meta_description', {}).get('exists'):
            seo_score -= 20
        if html_val.get('headings', {}).get('h1', 0) == 0:
            seo_score -= 15
        if not html_val.get('meta_viewport'):
            seo_score -= 10

        # Security Score (0-100)
        security_score = 100
        security_headers = analysis_data.get('security_headers', {})
        missing_headers = security_headers.get('missing_headers', [])
        security_score -= len(missing_headers) * 10

        js_issues = len(analysis_data.get('javascript_analysis', {}).get('security_issues', []))
        security_score -= js_issues * 15

        # Performance Score (0-100)
        performance_score = 100
        load_time = analysis_data.get('performance', {}).get('total_load_time', 0)
        if load_time > 3:
            performance_score -= 30
        elif load_time > 1:
            performance_score -= 10

        self.results['scores'] = {
            'seo': max(0, seo_score),
            'security': max(0, security_score),
            'performance': max(0, performance_score),
            'overall': max(0, (seo_score + security_score + performance_score) / 3)
        }

    def run_full_analysis(self) -> Dict[str, Any]:
        """Run complete website analysis."""
        print(f"Starting comprehensive analysis of {self.base_url}")
        
        try:
            # Get main page content
            response = self.session.get(self.base_url, timeout=self.timeout)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Run all analysis modules
            analysis_data = {
                'robots_sitemap': self.check_robots_sitemap(),
                'html_validation': self.validate_html(soup),
                'javascript_analysis': self.analyze_javascript(soup),
                'ssl_certificate': self.check_ssl_certificate(),
                'security_headers': self.check_security_headers(),
                'api_endpoints': self.test_api_endpoints(),
                'performance': self.measure_performance()
            }
            
            # Generate issues and recommendations
            self.generate_issues_and_recommendations(analysis_data)
            
            # Calculate scores
            self.calculate_scores(analysis_data)
            
            # Combine all results
            self.results.update(analysis_data)
            
            print("Analysis completed successfully!")
            return self.results
            
        except Exception as e:
            print(f"Analysis failed: {str(e)}")
            self.results['error'] = str(e)
            return self.results

    def save_report(self, filename: str = 'website_analysis_report.txt') -> None:
        """Save analysis report to file."""
        print(f"Saving report to {filename}")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("COMPREHENSIVE WEBSITE ANALYSIS REPORT\n")
            f.write("=" * 80 + "\n\n")
            
            f.write(f"Analysis Date: {self.results['timestamp']}\n")
            f.write(f"Target URL: {self.results['url']}\n\n")
            
            # Overall Scores
            f.write("OVERALL SCORES\n")
            f.write("-" * 40 + "\n")
            scores = self.results.get('scores', {})
            f.write(f"SEO Score: {scores.get('seo', 0)}/100\n")
            f.write(f"Security Score: {scores.get('security', 0)}/100\n")
            f.write(f"Performance Score: {scores.get('performance', 0)}/100\n")
            f.write(f"Overall Score: {scores.get('overall', 0):.1f}/100\n\n")
            
            # Issues Summary
            f.write("ISSUES FOUND\n")
            f.write("-" * 40 + "\n")
            issues = self.results.get('issues', [])
            if not issues:
                f.write("No critical issues found.\n\n")
            else:
                high_issues = [i for i in issues if i['severity'] == 'high']
                medium_issues = [i for i in issues if i['severity'] == 'medium']
                low_issues = [i for i in issues if i['severity'] == 'low']
                
                f.write(f"High Priority: {len(high_issues)} issues\n")
                f.write(f"Medium Priority: {len(medium_issues)} issues\n")
                f.write(f"Low Priority: {len(low_issues)} issues\n\n")
                
                for issue in issues:
                    f.write(f"[{issue['severity'].upper()}] {issue['category']}: {issue['issue']}\n")
                    f.write(f"  Description: {issue['description']}\n\n")
            
            # Recommendations
            f.write("RECOMMENDATIONS\n")
            f.write("-" * 40 + "\n")
            recommendations = self.results.get('recommendations', [])
            if recommendations:
                for i, rec in enumerate(recommendations, 1):
                    f.write(f"{i}. {rec}\n")
            else:
                f.write("No specific recommendations at this time.\n")
            f.write("\n")
            
            # Detailed Analysis Results
            f.write("DETAILED ANALYSIS\n")
            f.write("-" * 40 + "\n")
            
            # Performance Metrics
            perf = self.results.get('performance', {})
            f.write(f"Performance:\n")
            f.write(f"  Load Time: {perf.get('total_load_time', 'N/A')}s\n")
            f.write(f"  Status Code: {perf.get('status_code', 'N/A')}\n")
            f.write(f"  Content Length: {perf.get('content_length', 'N/A')} bytes\n\n")
            
            # SEO Analysis
            html_val = self.results.get('html_validation', {})
            f.write(f"SEO Elements:\n")
            f.write(f"  Title Tag: {'✓' if html_val.get('title', {}).get('exists') else '✗'}\n")
            f.write(f"  Meta Description: {'✓' if html_val.get('meta_description', {}).get('exists') else '✗'}\n")
            f.write(f"  H1 Tags: {html_val.get('headings', {}).get('h1', 0)}\n")
            f.write(f"  Meta Viewport: {'✓' if html_val.get('meta_viewport') else '✗'}\n\n")
            
            # Security Headers
            sec_headers = self.results.get('security_headers', {})
            f.write(f"Security Headers:\n")
            headers = sec_headers.get('headers', {})
            for header, value in headers.items():
                status = '✓' if value else '✗'
                f.write(f"  {header}: {status}\n")
            f.write("\n")
            
            # API Endpoints
            api_results = self.results.get('api_endpoints', {})
            f.write(f"API Endpoints Status:\n")
            for endpoint, result in api_results.items():
                if 'error' in result:
                    f.write(f"  {endpoint}: ERROR - {result['error']}\n")
                else:
                    f.write(f"  {endpoint}: HTTP {result.get('status_code')} ({result.get('response_time')}s)\n")
            
            f.write("\n" + "=" * 80 + "\n")
            f.write("End of Report\n")

def main():
    """Main function to run the website analysis."""
    # Analyze localhost Bitcoin platform
    analyzer = WebsiteAnalyzer('http://localhost:5000')
    
    # Run complete analysis
    results = analyzer.run_full_analysis()
    
    # Save comprehensive report
    analyzer.save_report('website_analysis_report.txt')
    
    print("\nAnalysis complete! Report saved to website_analysis_report.txt")
    print(f"Overall Score: {results.get('scores', {}).get('overall', 0):.1f}/100")

if __name__ == "__main__":
    main()